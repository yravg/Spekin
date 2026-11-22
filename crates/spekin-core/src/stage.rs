use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// The eight workflow stages, in header order (R-WF-1). The ids match the sample and the URL (/p/:project/:stage).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum StageId {
    Planning,
    Spec,
    Design,
    Frontend,
    Backend,
    Integration,
    Testing,
    Deploy,
}

impl StageId {
    pub const ORDER: [StageId; 8] = [
        StageId::Planning,
        StageId::Spec,
        StageId::Design,
        StageId::Frontend,
        StageId::Backend,
        StageId::Integration,
        StageId::Testing,
        StageId::Deploy,
    ];
}

/// How a stage reads in the header. The text says it in words; the tone only picks the mark (never colour alone, R-WF-6).
/// ok = ready, half = in progress, ring = not started, warn = needs review, bad = blocked.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[serde(rename_all = "lowercase")]
#[ts(export)]
pub enum StageTone {
    Ok,
    Half,
    Ring,
    Warn,
    Bad,
}

/// One stage in the header (S35, F101).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Stage {
    pub id: StageId,
    /// Two-digit position label, "01" to "08".
    pub n: String,
    pub name: String,
    pub st: StageTone,
    /// Status in words, for example "In progress · 3 to review".
    pub text: String,
}
