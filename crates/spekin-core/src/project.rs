use serde::{Deserialize, Serialize};
use ts_rs::TS;

use crate::stage::Stage;

/// The project context shown in the top bar on every stage (S35, F103).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct Project {
    pub name: String,
    pub product: String,
    pub increment: String,
    /// Accepted spec revision, for example "r14".
    pub spec: String,
    pub user: String,
    pub initials: String,
}

/// The parts of the sample fixture the core understands today.
/// Unknown exports in the fixture file are ignored on purpose.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub struct Fixture {
    pub project: Project,
    pub stages: Vec<Stage>,
}

#[derive(Debug, thiserror::Error)]
pub enum FixtureError {
    #[error("fixture is not valid JSON for the core types: {0}")]
    Parse(#[from] serde_json::Error),
    #[error("fixture must list the eight stages in order; found {0}")]
    StageOrder(String),
}

impl Fixture {
    /// Parse a fixture and check the invariants the UI relies on.
    pub fn from_json(text: &str) -> Result<Self, FixtureError> {
        let f: Fixture = serde_json::from_str(text)?;
        let ids: Vec<_> = f.stages.iter().map(|s| s.id).collect();
        if ids != crate::stage::StageId::ORDER {
            return Err(FixtureError::StageOrder(format!("{ids:?}")));
        }
        Ok(f)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");

    #[test]
    fn sample_fixture_parses_with_eight_stages_in_order() {
        let f = Fixture::from_json(SAMPLE).expect("sample fixture parses");
        assert_eq!(f.project.name, "Meranti Yard");
        assert_eq!(f.stages.len(), 8);
        assert_eq!(f.stages[2].id, crate::stage::StageId::Design);
    }

    #[test]
    fn stage_order_is_enforced() {
        let broken = SAMPLE.replacen("\"id\": \"planning\"", "\"id\": \"testing\"", 1);
        assert!(matches!(
            Fixture::from_json(&broken),
            Err(FixtureError::StageOrder(_))
        ));
    }
}
