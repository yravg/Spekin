//! Model sources (ADR 0005) and capability registry (SPK-T-05, AC-SPK-6/7).
//!
//! Pure types and checks: no network, no IO, and API provider keys are never stored
//! or serialized here (only presence and optional last-4 tail).

use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// The three model sources (ADR 0005).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ModelSourceKind {
    Hosted,
    LocalCli,
    ApiProvider,
}

/// Spekin Connector status for Local CLI (bring your own agent).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ConnectorStatus {
    NotSetUp,
    Offline,
    Ready,
}

/// Local CLI (BYOA) source state.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct LocalCliSource {
    pub status: ConnectorStatus,
    pub connector_addr: Option<String>,
    pub agent: Option<String>,
}

/// API provider (BYOK) status. Stores key presence and an optional 4-char tail, never the key itself.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ApiKeyStatus {
    pub provider: String,
    pub present: bool,
    pub tail: Option<String>,
    pub base_url: Option<String>,
    pub requires_key: bool,
}

impl ApiKeyStatus {
    /// Construct status metadata from a raw secret without retaining the secret.
    pub fn from_secret(
        provider: impl Into<String>,
        secret: &str,
        base_url: Option<String>,
    ) -> Self {
        let trimmed = secret.trim();
        let present = !trimmed.is_empty();
        let tail = if trimmed.chars().count() >= 4 {
            let chars: Vec<char> = trimmed.chars().collect();
            Some(chars[chars.len() - 4..].iter().collect())
        } else {
            None
        };
        Self {
            provider: provider.into(),
            present,
            tail,
            base_url,
            requires_key: true,
        }
    }

    /// Construct a keyless local API endpoint (for example Ollama via Connector).
    pub fn keyless(provider: impl Into<String>, base_url: impl Into<String>) -> Self {
        Self {
            provider: provider.into(),
            present: false,
            tail: None,
            base_url: Some(base_url.into()),
            requires_key: false,
        }
    }
}

/// Explicit per-job model source (ADR 0005).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(tag = "kind", rename_all = "snake_case")]
#[ts(export)]
pub enum ModelSource {
    Hosted,
    LocalCli(LocalCliSource),
    ApiProvider(ApiKeyStatus),
}

impl ModelSource {
    pub fn kind(&self) -> ModelSourceKind {
        match self {
            ModelSource::Hosted => ModelSourceKind::Hosted,
            ModelSource::LocalCli(_) => ModelSourceKind::LocalCli,
            ModelSource::ApiProvider(_) => ModelSourceKind::ApiProvider,
        }
    }

    /// Only Hosted jobs touch the Spekin credit ledger (ADR 0005, AC-SPK-6/7).
    pub fn touches_ledger(&self) -> bool {
        matches!(self, ModelSource::Hosted)
    }

    /// Whether this source can accept a job right now.
    pub fn is_ready(&self) -> bool {
        match self {
            ModelSource::Hosted => true,
            ModelSource::LocalCli(cli) => cli.status == ConnectorStatus::Ready,
            ModelSource::ApiProvider(api) => !api.requires_key || api.present,
        }
    }
}

/// Price per 1,000 tokens in micro-credits (integer math, no floating point drift).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct PricePerUnit {
    pub rate_card: String,
    pub input_per_1k_micro_credits: u32,
    pub output_per_1k_micro_credits: u32,
    pub unit: String,
}

/// Availability of a model in the Hosted plan (matches S36 `st: sel | ok | off`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "snake_case")]
#[ts(export)]
pub enum ModelAvailability {
    Selected,
    Available,
    Unavailable,
}

/// Capability entry for one model (SPK-T-05).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct ModelCapability {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub context_tokens: u32,
    pub max_output_tokens: u32,
    pub image_input: bool,
    pub tools: bool,
    pub price: Option<PricePerUnit>,
    pub availability: ModelAvailability,
}

/// Requirements of a job to validate against the capability registry before execution.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct JobRequirements {
    pub model_id: String,
    pub source: ModelSource,
    pub input_tokens: u32,
    pub needs_image_input: bool,
    pub needs_tools: bool,
}

/// Outcome of a passed capability check.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CapabilityCheckResult {
    pub model_id: String,
    pub source_kind: ModelSourceKind,
    pub touches_ledger: bool,
    pub rate_card: Option<String>,
}

/// Reasons a job fails pre-run capability or source validation.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS, thiserror::Error)]
#[serde(tag = "code", rename_all = "snake_case")]
#[ts(export)]
pub enum CapabilityError {
    #[error("unknown model: {0}")]
    UnknownModel(String),
    #[error("model {0} is not available on the Hosted plan")]
    ModelUnavailable(String),
    #[error("model source {0:?} is not ready")]
    SourceNotReady(ModelSourceKind),
    #[error("context size {requested} exceeds limit {limit} for {model_id}")]
    ContextExceeded {
        model_id: String,
        requested: u32,
        limit: u32,
    },
    #[error("model {0} does not support image input")]
    ImageInputUnsupported(String),
    #[error("model {0} does not support tool calls")]
    ToolsUnsupported(String),
    #[error("model {0} has no active rate card for Hosted billing")]
    MissingRateCard(String),
}

/// Registry of known models and their declared capabilities.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct CapabilityRegistry {
    models: Vec<ModelCapability>,
}

impl CapabilityRegistry {
    pub fn new(models: Vec<ModelCapability>) -> Self {
        Self { models }
    }

    /// Sample capability registry matching S36 (`sample/parts/models.mjs`, Meranti Yard).
    pub fn sample_s36() -> Self {
        let rc7 = |input, output| {
            Some(PricePerUnit {
                rate_card: "rc-7".into(),
                input_per_1k_micro_credits: input,
                output_per_1k_micro_credits: output,
                unit: "micro-credits / 1k tokens".into(),
            })
        };
        Self::new(vec![
            ModelCapability {
                id: "claude-sonnet-5-5".into(),
                name: "Sonnet 5.5".into(),
                provider: "Anthropic".into(),
                context_tokens: 200_000,
                max_output_tokens: 16_000,
                image_input: true,
                tools: true,
                price: rc7(300, 1_500),
                availability: ModelAvailability::Selected,
            },
            ModelCapability {
                id: "claude-haiku-5".into(),
                name: "Haiku 5".into(),
                provider: "Anthropic".into(),
                context_tokens: 200_000,
                max_output_tokens: 8_000,
                image_input: true,
                tools: true,
                price: rc7(80, 400),
                availability: ModelAvailability::Available,
            },
            ModelCapability {
                id: "claude-opus-5".into(),
                name: "Opus 5".into(),
                provider: "Anthropic".into(),
                context_tokens: 200_000,
                max_output_tokens: 32_000,
                image_input: true,
                tools: true,
                price: rc7(1_500, 7_500),
                availability: ModelAvailability::Unavailable,
            },
        ])
    }

    pub fn get(&self, id: &str) -> Option<&ModelCapability> {
        self.models.iter().find(|m| m.id == id)
    }

    pub fn list(&self) -> &[ModelCapability] {
        &self.models
    }

    /// Validate that a job's source and model satisfy all declared capabilities and billing rules.
    pub fn check_job(
        &self,
        req: &JobRequirements,
    ) -> Result<CapabilityCheckResult, CapabilityError> {
        let model = self
            .get(&req.model_id)
            .ok_or_else(|| CapabilityError::UnknownModel(req.model_id.clone()))?;

        if !req.source.is_ready() {
            return Err(CapabilityError::SourceNotReady(req.source.kind()));
        }

        let touches_ledger = req.source.touches_ledger();
        if touches_ledger && model.availability == ModelAvailability::Unavailable {
            return Err(CapabilityError::ModelUnavailable(model.id.clone()));
        }

        if req.input_tokens > model.context_tokens {
            return Err(CapabilityError::ContextExceeded {
                model_id: model.id.clone(),
                requested: req.input_tokens,
                limit: model.context_tokens,
            });
        }

        if req.needs_image_input && !model.image_input {
            return Err(CapabilityError::ImageInputUnsupported(model.id.clone()));
        }

        if req.needs_tools && !model.tools {
            return Err(CapabilityError::ToolsUnsupported(model.id.clone()));
        }

        let rate_card = if touches_ledger {
            let price = model
                .price
                .as_ref()
                .ok_or_else(|| CapabilityError::MissingRateCard(model.id.clone()))?;
            Some(price.rate_card.clone())
        } else {
            None
        };

        Ok(CapabilityCheckResult {
            model_id: model.id.clone(),
            source_kind: req.source.kind(),
            touches_ledger,
            rate_card,
        })
    }
}
