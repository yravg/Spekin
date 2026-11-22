//! GitHub skill source adapter (ADR 0007, AC-SPK-39).
//!
//! Pure rules for importing skills from a public GitHub repository: validate the
//! repo reference, find `SKILL.md` files, require and identify an upstream
//! licence, attach pinned provenance to each manifest, and plan update checks
//! with IMP-22's `check_update`. No IO and no network live in this module; the
//! server injects a transport that supplies a [`GitHubSnapshot`].

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::skills::{
    SkillManifest, SkillSource, UpdateCheck, UpdatePolicy, check_update, parse_skill_md,
};

/// A validated public GitHub repository reference (owner/repo).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct GitHubRepo {
    pub owner: String,
    pub repo: String,
}

impl GitHubRepo {
    /// The `owner/repo` form used in `SkillSource::Github` and in notices.
    pub fn slug(&self) -> String {
        format!("{}/{}", self.owner, self.repo)
    }
}

/// One file fetched from the repository, as plain data (never executed).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct GitHubFile {
    pub path: String,
    pub content: String,
}

/// Everything the adapter needs from a repository, supplied by a transport.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct GitHubSnapshot {
    pub repo: GitHubRepo,
    /// The pinned commit sha: every imported skill records it.
    pub commit: String,
    pub files: Vec<GitHubFile>,
}

/// The upstream licence file and the SPDX identifier detected in it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LicenseFile {
    pub path: String,
    pub spdx: String,
    pub text: String,
}

/// Failures from validating or importing a GitHub skill source.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[serde(tag = "code", rename_all = "snake_case")]
#[ts(export)]
pub enum GitHubSourceError {
    #[error("not a valid GitHub repository reference: {input}")]
    InvalidRepoUrl { input: String },
    #[error("unsupported source host: {host} (only github.com is supported)")]
    UnsupportedHost { host: String },
    #[error("repository {repo} has no licence; refusing the import")]
    NoLicense { repo: String },
    #[error("repository {repo} has no SKILL.md files")]
    NoSkillsFound { repo: String },
    #[error("SKILL.md at {path} is invalid: {message}")]
    InvalidSkill { path: String, message: String },
    #[error("file {path} is missing from the repository snapshot")]
    MissingFile { path: String },
    #[error("snapshot repo {found} does not match requested repo {expected}")]
    RepoMismatch { expected: String, found: String },
    #[error("GitHub transport failed: {message}")]
    Transport { message: String },
}

fn valid_segment(s: &str) -> bool {
    !s.is_empty()
        && s != "."
        && s != ".."
        && s.chars()
            .all(|c| c.is_ascii_alphanumeric() || c == '.' || c == '_' || c == '-')
}

/// Parse `owner/repo` or a public `https://github.com/owner/repo[/...]` link.
/// A `/tree/<ref>/<subpath>` suffix is ignored: the adapter reads the whole repo.
pub fn parse_github_repo(input: &str) -> Result<GitHubRepo, GitHubSourceError> {
    let input = input.trim();
    let (rest, is_url) = if let Some(after) = input.strip_prefix("https://") {
        let (host, path) =
            after
                .split_once('/')
                .ok_or_else(|| GitHubSourceError::InvalidRepoUrl {
                    input: input.into(),
                })?;
        let host = host.to_ascii_lowercase();
        if host != "github.com" && host != "www.github.com" {
            return Err(GitHubSourceError::UnsupportedHost { host });
        }
        (path, true)
    } else {
        if input.contains("://") || input.starts_with("git@") {
            return Err(GitHubSourceError::InvalidRepoUrl {
                input: input.into(),
            });
        }
        (input, false)
    };

    let mut parts = rest.split('/');
    let owner = parts.next().unwrap_or("").trim();
    let mut repo = parts.next().unwrap_or("").trim();
    let has_extra = parts.next().is_some();
    if let Some(stripped) = repo.strip_suffix(".git") {
        repo = stripped;
    }
    if !valid_segment(owner) || !valid_segment(repo) || (has_extra && !is_url) {
        return Err(GitHubSourceError::InvalidRepoUrl {
            input: input.into(),
        });
    }
    Ok(GitHubRepo {
        owner: owner.into(),
        repo: repo.into(),
    })
}

fn file_name(path: &str) -> Option<&str> {
    path.rsplit('/').next().filter(|s| !s.is_empty())
}

fn is_candidate_path(path: &str) -> bool {
    let segments: Vec<&str> = path.split('/').collect();
    segments.iter().all(|s| {
        !s.is_empty()
            && !s.starts_with('.')
            && !matches!(*s, "node_modules" | "vendor" | "dist" | "target")
    })
}

/// Whether a path is a skill file (case-insensitive `SKILL.md`), excluding
/// hidden folders and vendored/build output.
pub fn is_skill_path(path: &str) -> bool {
    is_candidate_path(path)
        && file_name(path).is_some_and(|name| name.eq_ignore_ascii_case("SKILL.md"))
}

/// Whether a path looks like an upstream licence file.
pub fn is_license_path(path: &str) -> bool {
    is_candidate_path(path)
        && file_name(path).is_some_and(|name| {
            matches!(
                name.to_ascii_lowercase().as_str(),
                "license" | "licence" | "license.md" | "licence.md" | "license.txt" | "licence.txt"
            )
        })
}

/// Sorted, deduplicated skill paths in the snapshot.
pub fn discover_skill_paths(files: &[GitHubFile]) -> Vec<String> {
    let mut paths: Vec<String> = files
        .iter()
        .filter(|f| is_skill_path(&f.path))
        .map(|f| f.path.clone())
        .collect();
    paths.sort();
    paths.dedup();
    paths
}

fn detect_spdx(text: &str) -> Option<&'static str> {
    let lower = text.to_ascii_lowercase();
    if lower.contains("apache license") && lower.contains("version 2.0") {
        Some("Apache-2.0")
    } else if lower.contains("mit license")
        || lower.contains("permission is hereby granted, free of charge")
    {
        Some("MIT")
    } else if lower.contains("gnu general public license") {
        if lower.contains("version 3") {
            Some("GPL-3.0-or-later")
        } else if lower.contains("version 2") {
            Some("GPL-2.0-or-later")
        } else {
            Some("GPL")
        }
    } else if lower.contains("mozilla public license") && lower.contains("2.0") {
        Some("MPL-2.0")
    } else if lower.contains("bsd 3-clause") {
        Some("BSD-3-Clause")
    } else {
        None
    }
}

/// Find the licence file, preferring a root-level file. Repos with no licence
/// file are refused by [`import_repository`].
pub fn detect_license(files: &[GitHubFile]) -> Option<LicenseFile> {
    let mut candidates: Vec<&GitHubFile> =
        files.iter().filter(|f| is_license_path(&f.path)).collect();
    candidates
        .sort_by(|a, b| (a.path.contains('/'), &a.path).cmp(&(b.path.contains('/'), &b.path)));
    let file = candidates.first()?;
    Some(LicenseFile {
        path: file.path.clone(),
        spdx: detect_spdx(&file.content).unwrap_or("UNKNOWN").into(),
        text: file.content.clone(),
    })
}

/// The provenance block appended to every imported skill's notice.
pub fn build_notice(repo: &GitHubRepo, commit: &str, license: &LicenseFile) -> String {
    format!(
        "Source: github.com/{}@{commit}\nLicence: {}\nSee {} in the upstream repository.",
        repo.slug(),
        license.spdx,
        license.path
    )
}

/// Parse one upstream `SKILL.md` into a manifest with pinned GitHub source,
/// the repository licence (not frontmatter) and upstream notice preserved.
pub fn import_skill(
    repo: &GitHubRepo,
    snapshot: &GitHubSnapshot,
    path: &str,
) -> Result<SkillManifest, GitHubSourceError> {
    if snapshot.repo != *repo {
        return Err(GitHubSourceError::RepoMismatch {
            expected: repo.slug(),
            found: snapshot.repo.slug(),
        });
    }
    let license = detect_license(&snapshot.files)
        .ok_or_else(|| GitHubSourceError::NoLicense { repo: repo.slug() })?;
    let file = snapshot
        .files
        .iter()
        .find(|f| f.path == path)
        .ok_or_else(|| GitHubSourceError::MissingFile { path: path.into() })?;

    let mut manifest =
        parse_skill_md(&file.content).map_err(|e| GitHubSourceError::InvalidSkill {
            path: path.into(),
            message: e.to_string(),
        })?;
    manifest.source = SkillSource::Github {
        repo: repo.slug(),
        path: path.into(),
        commit: snapshot.commit.clone(),
    };
    manifest.licence = license.spdx.clone();
    let provenance = build_notice(repo, &snapshot.commit, &license);
    manifest.notice = Some(match manifest.notice.take() {
        Some(upstream) if !upstream.trim().is_empty() => format!("{upstream}\n{provenance}"),
        _ => provenance,
    });
    Ok(manifest)
}

/// Import every skill in a repository. A repo with no licence is refused.
pub fn import_repository(
    repo: &GitHubRepo,
    snapshot: &GitHubSnapshot,
) -> Result<Vec<SkillManifest>, GitHubSourceError> {
    if detect_license(&snapshot.files).is_none() {
        return Err(GitHubSourceError::NoLicense { repo: repo.slug() });
    }
    let paths = discover_skill_paths(&snapshot.files);
    if paths.is_empty() {
        return Err(GitHubSourceError::NoSkillsFound { repo: repo.slug() });
    }
    paths
        .iter()
        .map(|path| import_skill(repo, snapshot, path))
        .collect()
}

/// Check stored skills against freshly imported ones with the source policy.
/// Skills that are new upstream are not updates and are skipped.
pub fn plan_updates(
    stored: &[SkillManifest],
    fetched: &[SkillManifest],
    policy: UpdatePolicy,
) -> Vec<UpdateCheck> {
    let mut checks = Vec::new();
    for new in fetched {
        if let Some(old) = stored.iter().find(|s| s.id == new.id) {
            checks.push(check_update(old, new, policy));
        }
    }
    checks.sort_by(|a, b| a.skill_id.cmp(&b.skill_id));
    checks
}
