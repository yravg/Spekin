//! GitHub skill source adapter: the IO side of ADR 0007.
//!
//! A transport supplies a repository snapshot; the adapter calls the pure
//! rules in `spekin-core`. Tests inject a fake transport and never touch the
//! network. `HttpGitHubTransport` is the real, public-GitHub implementation.

use spekin_core::github_source::{
    GitHubFile, GitHubRepo, GitHubSnapshot, GitHubSourceError, import_repository, is_license_path,
    is_skill_path, parse_github_repo, plan_updates,
};
use spekin_core::skills::{SkillManifest, UpdateCheck, UpdatePolicy};

/// Supplies the raw files of a public GitHub repository.
#[allow(async_fn_in_trait)]
pub trait GitHubTransport: Send + Sync {
    async fn fetch_snapshot(&self, repo: &GitHubRepo) -> Result<GitHubSnapshot, GitHubSourceError>;
}

/// Turns a repository reference into imported skills or update checks. No rule
/// is decided here: validation, licence policy and update policy live in core.
pub struct GitHubSourceAdapter<T> {
    transport: T,
}

impl<T: GitHubTransport> GitHubSourceAdapter<T> {
    pub fn new(transport: T) -> Self {
        Self { transport }
    }

    /// Import all skills from a public repo, refusing one without a licence.
    pub async fn import(
        &self,
        url_or_slug: &str,
    ) -> Result<Vec<SkillManifest>, GitHubSourceError> {
        let repo = parse_github_repo(url_or_slug)?;
        let snapshot = self.transport.fetch_snapshot(&repo).await?;
        import_repository(&repo, &snapshot)
    }

    /// Compare stored skills with the current upstream revision.
    pub async fn check_for_updates(
        &self,
        url_or_slug: &str,
        stored: &[SkillManifest],
        policy: UpdatePolicy,
    ) -> Result<Vec<UpdateCheck>, GitHubSourceError> {
        let fetched = self.import(url_or_slug).await?;
        Ok(plan_updates(stored, &fetched, policy))
    }
}

/// Real transport for public GitHub repositories. Only files the adapter needs
/// (SKILL.md and licence files) are fetched, and each is pinned to a commit.
pub struct HttpGitHubTransport {
    client: reqwest::Client,
}

impl Default for HttpGitHubTransport {
    fn default() -> Self {
        Self::new()
    }
}

impl HttpGitHubTransport {
    pub fn new() -> Self {
        let client = reqwest::Client::builder()
            .user_agent(concat!("spekin-skills/", env!("CARGO_PKG_VERSION")))
            .build()
            .unwrap_or_else(|_| reqwest::Client::new());
        Self { client }
    }

    async fn get_json(&self, url: &str) -> Result<serde_json::Value, GitHubSourceError> {
        let response = self
            .client
            .get(url)
            .header("Accept", "application/vnd.github+json")
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
        response.json::<serde_json::Value>().await.map_err(|e| {
            GitHubSourceError::Transport {
                message: e.to_string(),
            }
        })
    }

    async fn fetch_raw(
        &self,
        repo: &GitHubRepo,
        commit: &str,
        path: &str,
    ) -> Result<String, GitHubSourceError> {
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

        let response = self
            .client
            .get(url)
            .send()
            .await
            .map_err(|e| GitHubSourceError::Transport {
                message: e.to_string(),
            })?;
        let status = response.status();
        if !status.is_success() {
            return Err(GitHubSourceError::Transport {
                message: format!("raw {path} -> {status}"),
            });
        }
        response.text().await.map_err(|e| GitHubSourceError::Transport {
            message: e.to_string(),
        })
    }
}

#[allow(async_fn_in_trait)]
impl GitHubTransport for HttpGitHubTransport {
    async fn fetch_snapshot(&self, repo: &GitHubRepo) -> Result<GitHubSnapshot, GitHubSourceError> {
        let base = format!("https://api.github.com/repos/{}/{}", repo.owner, repo.repo);
        let meta = self.get_json(&base).await?;
        let branch = meta
            .get("default_branch")
            .and_then(serde_json::Value::as_str)
            .ok_or_else(|| GitHubSourceError::Transport {
                message: "repository metadata has no default_branch".into(),
            })?;
        let head = self.get_json(&format!("{base}/commits/{branch}")).await?;
        let commit = head
            .get("sha")
            .and_then(serde_json::Value::as_str)
            .ok_or_else(|| GitHubSourceError::Transport {
                message: "commit metadata has no sha".into(),
            })?
            .to_string();

        let tree = self
            .get_json(&format!("{base}/git/trees/{branch}?recursive=1"))
            .await?;
        let entries = tree
            .get("tree")
            .and_then(serde_json::Value::as_array)
            .ok_or_else(|| GitHubSourceError::Transport {
                message: "tree response has no entries".into(),
            })?;

        let mut files = Vec::new();
        for entry in entries {
            if entry.get("type").and_then(serde_json::Value::as_str) != Some("blob") {
                continue;
            }
            let Some(path) = entry.get("path").and_then(serde_json::Value::as_str) else {
                continue;
            };
            if !is_skill_path(path) && !is_license_path(path) {
                continue;
            }
            let content = self.fetch_raw(repo, &commit, path).await?;
            files.push(GitHubFile {
                path: path.into(),
                content,
            });
        }

        Ok(GitHubSnapshot {
            repo: repo.clone(),
            commit,
            files,
        })
    }
}
