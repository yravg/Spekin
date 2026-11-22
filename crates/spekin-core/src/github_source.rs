//! Pure rules for the GitHub skill source adapter (ADR 0007, IMP-27, AC-SPK-39).
//!
//! IO lives in `spekin-server::skills::github`; this module holds only data types
//! and rules: validating repo references and paths, reading the `files:` list
//! out of SKILL.md, detecting the upstream licence, enforcing the fetch limits,
//! assembling a bundle as plain data, and planning update checks with IMP-22.

use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::skills::{SkillManifest, SkillSource, UpdateCheck, UpdatePolicy, check_update, parse_skill_md};

/// Per-file, per-bundle and file-count limits for a GitHub skill fetch (IMP-27).
pub const MAX_FILE_BYTES: usize = 256 * 1024;
pub const MAX_BUNDLE_BYTES: usize = 2 * 1024 * 1024;
pub const MAX_FILES: usize = 50;

/// A validated public GitHub repository reference (owner/repo).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct GitHubRepo {
    pub owner: String,
    pub repo: String,
}

impl GitHubRepo {
    pub fn slug(&self) -> String {
        format!("{}/{}", self.owner, self.repo)
    }
}

/// A skill pinned to an exact commit SHA, never to a moving branch (IMP-27).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct PinnedSource {
    /// `owner/repo`.
    pub repo: String,
    /// Path to the SKILL.md inside the repository.
    pub path: String,
    /// The branch or tag the user asked for, kept for later update checks.
    pub git_ref: String,
    /// The resolved commit SHA.
    pub commit: String,
}

/// One downloaded file, kept as data and never executed.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct BundleFile {
    pub path: String,
    pub content: String,
}

/// The upstream licence file and the SPDX identifier detected in it.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LicenseFile {
    pub path: String,
    pub spdx: String,
    pub text: String,
}

/// The result of fetching one pinned skill: manifest, files and attribution.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct SkillBundle {
    pub source: PinnedSource,
    pub manifest: SkillManifest,
    pub files: Vec<BundleFile>,
    pub licence: LicenseFile,
}

/// Failures from validating, fetching or updating a GitHub skill source.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[serde(tag = "code", rename_all = "snake_case")]
#[ts(export)]
pub enum GitHubSourceError {
    #[error("not a valid GitHub repository reference: {input}")]
    InvalidRepoUrl { input: String },
    #[error("unsupported source host: {host} (only github.com is supported)")]
    UnsupportedHost { host: String },
    #[error("not a safe repository path: {path}")]
    InvalidPath { path: String },
    #[error("repository {repo} has no licence; refusing the import")]
    NoLicense { repo: String },
    #[error("SKILL.md at {path} is invalid: {message}")]
    InvalidSkill { path: String, message: String },
    #[error("could not resolve {git_ref} in {repo}")]
    RefNotFound { repo: String, git_ref: String },
    #[error("file {path} is missing from the repository")]
    MissingFile { path: String },
    #[error("file {path} is {bytes} bytes, over the {limit} byte limit")]
    FileTooLarge {
        path: String,
        bytes: usize,
        limit: usize,
    },
    #[error("bundle is {bytes} bytes, over the {limit} byte limit")]
    BundleTooLarge { bytes: usize, limit: usize },
    #[error("bundle has {count} files, over the {limit} file limit")]
    TooManyFiles { count: usize, limit: usize },
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
        let (host, path) = after.split_once('/').ok_or_else(|| GitHubSourceError::InvalidRepoUrl {
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

/// Normalise a user path to a SKILL.md file inside the repository. A directory
/// gets `/SKILL.md` appended; traversal and absolute paths are rejected.
pub fn skill_md_path(path: &str) -> Result<String, GitHubSourceError> {
    let path = path.trim().trim_start_matches("./").trim_end_matches('/');
    if path.is_empty() {
        return Ok("SKILL.md".into());
    }
    if path
        .split('/')
        .any(|s| s.is_empty() || s == "." || s == ".." || s.contains('\\'))
    {
        return Err(GitHubSourceError::InvalidPath { path: path.into() });
    }
    let resolved = if path.to_ascii_lowercase().ends_with("/skill.md")
        || path.eq_ignore_ascii_case("SKILL.md")
    {
        path.to_string()
    } else {
        format!("{path}/SKILL.md")
    };
    Ok(resolved)
}

/// Resolve a path listed in SKILL.md against the skill's directory.
pub fn join_relative(base: &str, relative: &str) -> Result<String, GitHubSourceError> {
    let relative = relative.trim().trim_start_matches("./");
    if relative.is_empty()
        || relative.starts_with('/')
        || relative.contains('\\')
        || relative
            .split('/')
            .any(|s| s.is_empty() || s == "." || s == "..")
    {
        return Err(GitHubSourceError::InvalidPath {
            path: relative.into(),
        });
    }
    let dir = base.rsplit_once('/').map(|(d, _)| d).unwrap_or("");
    Ok(if dir.is_empty() {
        relative.into()
    } else {
        format!("{dir}/{relative}")
    })
}

fn frontmatter(text: &str) -> Vec<String> {
    let normalized = text.replace("\r\n", "\n");
    let lines: Vec<&str> = normalized.lines().collect();
    if lines.first().map(|s| s.trim()) != Some("---") {
        return Vec::new();
    }
    let mut out = Vec::new();
    for line in lines.iter().skip(1) {
        if line.trim() == "---" {
            break;
        }
        out.push((*line).to_string());
    }
    out
}

/// The `files:` list declared in SKILL.md frontmatter (inline `[a, b]` or `- a`).
/// Scripts are only listed here; nothing is ever executed (IMP-27).
pub fn listed_files(text: &str) -> Vec<String> {
    let mut files = Vec::new();
    let mut in_files = false;
    for line in frontmatter(text) {
        let trimmed = line.trim();
        if let Some(value) = trimmed.strip_prefix("files:") {
            in_files = true;
            let value = value.trim();
            if value.starts_with('[') && value.ends_with(']') {
                files.extend(
                    value[1..value.len() - 1]
                        .split(',')
                        .map(str::trim)
                        .filter(|s| !s.is_empty())
                        .map(|s| s.trim_matches(['"', '\'']).to_string()),
                );
                in_files = false;
            }
            continue;
        }
        if in_files {
            if let Some(item) = trimmed.strip_prefix("- ") {
                files.push(item.trim().trim_matches(['"', '\'']).to_string());
            } else if !trimmed.is_empty() && !trimmed.starts_with('#') {
                in_files = false;
            }
        }
    }
    files
}

pub fn is_license_path(path: &str) -> bool {
    let name = path.rsplit('/').next().unwrap_or("").to_ascii_lowercase();
    matches!(
        name.as_str(),
        "license" | "licence" | "license.md" | "licence.md" | "license.txt" | "licence.txt"
    )
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
    } else {
        None
    }
}

pub fn license_from(path: &str, text: &str) -> LicenseFile {
    LicenseFile {
        path: path.into(),
        spdx: detect_spdx(text).unwrap_or("UNKNOWN").into(),
        text: text.into(),
    }
}

/// The provenance block appended to every imported skill's notice.
pub fn build_notice(source: &PinnedSource, license: &LicenseFile) -> String {
    format!(
        "Source: github.com/{}@{commit}\nLicence: {}\nSee {} in the upstream repository.",
        source.repo, license.spdx, license.path,
        commit = source.commit,
    )
}

/// Enforce the IMP-27 limits in pure data, before anything is stored.
pub fn check_bundle_limits(files: &[BundleFile]) -> Result<(), GitHubSourceError> {
    if files.len() > MAX_FILES {
        return Err(GitHubSourceError::TooManyFiles {
            count: files.len(),
            limit: MAX_FILES,
        });
    }
    let mut total = 0usize;
    for file in files {
        let bytes = file.content.len();
        if bytes > MAX_FILE_BYTES {
            return Err(GitHubSourceError::FileTooLarge {
                path: file.path.clone(),
                bytes,
                limit: MAX_FILE_BYTES,
            });
        }
        total += bytes;
        if total > MAX_BUNDLE_BYTES {
            return Err(GitHubSourceError::BundleTooLarge {
                bytes: total,
                limit: MAX_BUNDLE_BYTES,
            });
        }
    }
    Ok(())
}

/// Parse the fetched SKILL.md, attach pinned provenance and the repository
/// licence (not frontmatter), preserve the upstream notice, and enforce limits.
pub fn assemble_bundle(
    source: &PinnedSource,
    skill_md: &str,
    listed: Vec<BundleFile>,
    license: Option<LicenseFile>,
) -> Result<SkillBundle, GitHubSourceError> {
    let license = license.ok_or_else(|| GitHubSourceError::NoLicense {
        repo: source.repo.clone(),
    })?;
    let mut manifest = parse_skill_md(skill_md).map_err(|e| GitHubSourceError::InvalidSkill {
        path: source.path.clone(),
        message: e.to_string(),
    })?;
    manifest.source = SkillSource::Github {
        repo: source.repo.clone(),
        path: source.path.clone(),
        commit: source.commit.clone(),
    };
    manifest.licence = license.spdx.clone();
    let provenance = build_notice(source, &license);
    manifest.notice = Some(match manifest.notice.take() {
        Some(upstream) if !upstream.trim().is_empty() => format!("{upstream}\n{provenance}"),
        _ => provenance,
    });

    let mut files = vec![BundleFile {
        path: source.path.clone(),
        content: skill_md.into(),
    }];
    files.extend(listed);
    files.push(BundleFile {
        path: license.path.clone(),
        content: license.text.clone(),
    });
    check_bundle_limits(&files)?;

    Ok(SkillBundle {
        source: source.clone(),
        manifest,
        files,
        licence: license,
    })
}

/// Check stored skills against freshly parsed upstream ones with the policy.
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
