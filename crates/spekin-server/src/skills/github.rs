//! GitHub skill source adapter (IMP-27, ADR 0007).
//!
//! `resolve` pins a branch or tag to an exact commit SHA; `fetch` downloads a
//! SKILL.md, the files it lists and the repository licence as plain data under
//! strict size limits; `check` compares an installed skill with the current
//! upstream ref using IMP-22's `check_update`. All HTTP is behind
//! [`GitHubClient`], so tests use recorded fixtures and never touch the network.

use futures_util::StreamExt;
use reqwest::RequestBuilder;

use spekin_core::github_source::{
    BundleFile, GitHubRepo, GitHubSourceError, MAX_FILE_BYTES, PinnedSource, SkillBundle,
    assemble_bundle, join_relative, license_from, listed_files, parse_github_repo, skill_md_path,
};
use spekin_core::skills::{UpdateCheck, UpdatePolicy, check_update};

/// The only IO the adapter needs. Tests supply recorded fixtures instead.
#[allow(async_fn_in_trait)]
pub trait GitHubClient: Send + Sync {
    /// Resolve a branch or tag to a commit SHA.
    async fn resolve_ref(
        &self,
        repo: &GitHubRepo,
        git_ref: &str,
    ) -> Result<String, GitHubSourceError>;
    /// Download one file at an exact commit.
    async fn fetch_file(
        &self,
        repo: &GitHubRepo,
        commit: &str,
        path: &str,
    ) -> Result<String, GitHubSourceError>;
    /// Find and download the repository licence file.
    async fn fetch_license(
        &self,
        repo: &GitHubRepo,
        commit: &str,
    ) -> Result<BundleFile, GitHubSourceError>;
}

/// Public-GitHub HTTPS client. `GITHUB_TOKEN` is read per request and is never
/// logged or stored in any returned type.
pub struct HttpGitHubClient {
    client: reqwest::Client,
}

impl Default for HttpGitHubClient {
    fn default() -> Self {
        Self::new()
    }
}

impl HttpGitHubClient {
    pub fn new() -> Self {
        Self {
            client: reqwest::Client::builder()
                .user_agent(concat!("spekin-skills/", env!("CARGO_PKG_VERSION")))
                .build()
                .unwrap_or_else(|_| reqwest::Client::new()),
        }
    }

    fn auth(request: RequestBuilder) -> RequestBuilder {
        match std::env::var("GITHUB_TOKEN") {
            Ok(token) if !token.is_empty() => request.bearer_auth(token),
            _ => request,
        }
    }

    async fn get_json(&self, url: &str) -> Result<serde_json::Value, GitHubSourceError> {
        let response = Self::auth(
            self.client
                .get(url)
                .header("Accept", "application/vnd.github+json"),
        )
        .send()
        .await
        .map_err(|e| GitHubSourceError::Transport {
            message: e.to_string(),
        })?;
        let status = response.status();
        if !status.is_success() {
            return Err(GitHubSourceError::Transport {
                message: format!("{url} -> {status}"),
            });
        }
        response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| GitHubSourceError::Transport {
                message: e.to_string(),
            })
    }

    fn raw_url(
        repo: &GitHubRepo,
        commit: &str,
        path: &str,
    ) -> Result<reqwest::Url, GitHubSourceError> {
        let mut url = reqwest::Url::parse(&format!(
            "https://raw.githubusercontent.com/{}/{}/{}/",
            repo.owner, repo.repo, commit
        ))
        .map_err(|e| GitHubSourceError::Transport {
            message: e.to_string(),
        })?;
        url.path_segments_mut()
            .map_err(|_| GitHubSourceError::Transport {
                message: "cannot build a raw content URL".into(),
            })?
            .extend(path.split('/'));
        Ok(url)
    }
}

#[allow(async_fn_in_trait)]
impl GitHubClient for HttpGitHubClient {
    async fn resolve_ref(
        &self,
        repo: &GitHubRepo,
        git_ref: &str,
    ) -> Result<String, GitHubSourceError> {
        let url = format!(
            "https://api.github.com/repos/{}/{}/commits/{git_ref}",
            repo.owner, repo.repo
        );
        let commit = self
            .get_json(&url)
            .await?
            .get("sha")
            .and_then(serde_json::Value::as_str)
            .ok_or_else(|| GitHubSourceError::RefNotFound {
                repo: repo.slug(),
                git_ref: git_ref.into(),
            })?
            .to_string();
        if commit.is_empty() {
            return Err(GitHubSourceError::RefNotFound {
                repo: repo.slug(),
                git_ref: git_ref.into(),
            });
        }
        Ok(commit)
    }

    async fn fetch_file(
        &self,
        repo: &GitHubRepo,
        commit: &str,
        path: &str,
    ) -> Result<String, GitHubSourceError> {
        let url = Self::raw_url(repo, commit, path)?;
        let response = Self::auth(self.client.get(url)).send().await.map_err(|e| {
            GitHubSourceError::Transport {
                message: e.to_string(),
            }
        })?;
        let status = response.status();
        if !status.is_success() {
            return Err(GitHubSourceError::MissingFile { path: path.into() });
        }

        // Enforce the per-file limit while streaming, before the body is stored.
        let mut bytes = Vec::new();
        let mut stream = response.bytes_stream();
        while let Some(chunk) = stream.next().await {
            let chunk = chunk.map_err(|e| GitHubSourceError::Transport {
                message: e.to_string(),
            })?;
            if bytes.len() + chunk.len() > MAX_FILE_BYTES {
                return Err(GitHubSourceError::FileTooLarge {
                    path: path.into(),
                    bytes: bytes.len() + chunk.len(),
                    limit: MAX_FILE_BYTES,
                });
            }
            bytes.extend_from_slice(&chunk);
        }
        String::from_utf8(bytes).map_err(|e| GitHubSourceError::InvalidSkill {
            path: path.into(),
            message: e.to_string(),
        })
    }

    async fn fetch_license(
        &self,
        repo: &GitHubRepo,
        commit: &str,
    ) -> Result<BundleFile, GitHubSourceError> {
        for name in [
            "LICENSE",
            "LICENSE.md",
            "LICENSE.txt",
            "LICENCE",
            "LICENCE.md",
            "LICENCE.txt",
        ] {
            if let Ok(content) = self.fetch_file(repo, commit, name).await {
                return Ok(BundleFile {
                    path: name.into(),
                    content,
                });
            }
        }
        Err(GitHubSourceError::NoLicense { repo: repo.slug() })
    }
}

/// IO adapter. No business rule is decided here: validation, licence policy,
/// limits and update policy all come from `spekin-core`.
pub struct GitHubSkillSource<C> {
    client: C,
}

impl<C: GitHubClient> GitHubSkillSource<C> {
    pub fn new(client: C) -> Self {
        Self { client }
    }

    /// Pin a branch or tag to an exact commit SHA.
    pub async fn resolve(
        &self,
        repo: &str,
        path: &str,
        git_ref: &str,
    ) -> Result<PinnedSource, GitHubSourceError> {
        let repo_ref = parse_github_repo(repo)?;
        let git_ref = git_ref.trim();
        let commit = self.client.resolve_ref(&repo_ref, git_ref).await?;
        if commit.is_empty() {
            return Err(GitHubSourceError::RefNotFound {
                repo: repo_ref.slug(),
                git_ref: git_ref.into(),
            });
        }
        Ok(PinnedSource {
            repo: repo_ref.slug(),
            path: skill_md_path(path)?,
            git_ref: git_ref.into(),
            commit,
        })
    }

    /// Download one pinned skill and everything it lists, as plain data.
    /// Scripts are only listed in the bundle; nothing is executed.
    pub async fn fetch(&self, pinned: &PinnedSource) -> Result<SkillBundle, GitHubSourceError> {
        let repo_ref = parse_github_repo(&pinned.repo)?;
        let skill_md = self
            .client
            .fetch_file(&repo_ref, &pinned.commit, &pinned.path)
            .await?;

        let mut listed = Vec::new();
        for relative in listed_files(&skill_md) {
            let path = join_relative(&pinned.path, &relative)?;
            let content = self
                .client
                .fetch_file(&repo_ref, &pinned.commit, &path)
                .await?;
            listed.push(BundleFile { path, content });
        }

        let license = self.client.fetch_license(&repo_ref, &pinned.commit).await?;
        let license = license_from(&license.path, &license.content);
        assemble_bundle(pinned, &skill_md, listed, Some(license))
    }

    /// Resolve the same ref again and classify its change under `policy`.
    pub async fn check(
        &self,
        installed: &SkillBundle,
        policy: UpdatePolicy,
    ) -> Result<UpdateCheck, GitHubSourceError> {
        let source = self
            .resolve(
                &installed.source.repo,
                &installed.source.path,
                &installed.source.git_ref,
            )
            .await?;
        let repo_ref = parse_github_repo(&source.repo)?;
        let skill_md = self
            .client
            .fetch_file(&repo_ref, &source.commit, &source.path)
            .await?;
        let license = self.client.fetch_license(&repo_ref, &source.commit).await?;
        let license = license_from(&license.path, &license.content);
        let fresh = assemble_bundle(&source, &skill_md, Vec::new(), Some(license))?;
        Ok(check_update(&installed.manifest, &fresh.manifest, policy))
    }
}
