use spekin_core::model_source::{
    ApiKeyStatus, CapabilityError, CapabilityRegistry, ConnectorStatus, JobRequirements,
    LocalCliSource, ModelAvailability, ModelCapability, ModelSource, ModelSourceKind, PricePerUnit,
};

#[test]
fn only_hosted_jobs_touch_the_ledger() {
    let hosted = ModelSource::Hosted;
    let cli = ModelSource::LocalCli(LocalCliSource {
        status: ConnectorStatus::Ready,
        connector_addr: Some("127.0.0.1:47821".into()),
        agent: Some("Claude Code".into()),
    });
    let api = ModelSource::ApiProvider(ApiKeyStatus::from_secret(
        "Anthropic",
        "test-provider-key-9f2a",
        Some("https://api.anthropic.com".into()),
    ));

    assert!(hosted.touches_ledger());
    assert!(!cli.touches_ledger());
    assert!(!api.touches_ledger());
}

#[test]
fn api_provider_stores_key_presence_and_tail_never_the_raw_key() {
    let secret = "test-never-store-this-secret-9f2a";
    let status = ApiKeyStatus::from_secret(
        "Anthropic",
        secret,
        Some("https://api.anthropic.com".into()),
    );
    assert!(status.present);
    assert_eq!(status.tail.as_deref(), Some("9f2a"));

    let json = serde_json::to_string(&status).expect("serialize ApiKeyStatus");
    assert!(!json.contains(secret), "raw key must never appear in JSON");
    assert!(!json.contains("never-store"));
    assert!(json.contains("\"present\":true"));

    let empty = ApiKeyStatus::from_secret("Anthropic", "   ", None);
    assert!(!empty.present);
    assert_eq!(empty.tail, None);
    assert!(!ModelSource::ApiProvider(empty).is_ready());
}

#[test]
fn local_cli_connector_statuses_gate_readiness() {
    for (status, expected_ready) in [
        (ConnectorStatus::NotSetUp, false),
        (ConnectorStatus::Offline, false),
        (ConnectorStatus::Ready, true),
    ] {
        let src = ModelSource::LocalCli(LocalCliSource {
            status,
            connector_addr: None,
            agent: None,
        });
        assert_eq!(src.is_ready(), expected_ready);
        assert_eq!(src.kind(), ModelSourceKind::LocalCli);
    }
}

#[test]
fn s36_sample_registry_validates_capabilities_and_limits() {
    let reg = CapabilityRegistry::sample_s36();
    assert_eq!(reg.list().len(), 3);

    // Sonnet 5.5 Hosted with image + tools within 200k context succeeds and touches ledger.
    let ok = reg
        .check_job(&JobRequirements {
            model_id: "claude-sonnet-5-5".into(),
            source: ModelSource::Hosted,
            input_tokens: 9_800,
            needs_image_input: true,
            needs_tools: true,
        })
        .expect("Sonnet 5.5 Hosted should pass");
    assert!(ok.touches_ledger);
    assert_eq!(ok.rate_card.as_deref(), Some("rc-7"));

    // Context overflow is rejected.
    let err = reg
        .check_job(&JobRequirements {
            model_id: "claude-sonnet-5-5".into(),
            source: ModelSource::Hosted,
            input_tokens: 250_000,
            needs_image_input: false,
            needs_tools: false,
        })
        .unwrap_err();
    assert!(matches!(
        err,
        CapabilityError::ContextExceeded {
            requested: 250_000,
            limit: 200_000,
            ..
        }
    ));

    // Opus 5 is unavailable on Hosted plan, but allowed on BYOK API provider (and does not touch ledger).
    let hosted_opus = reg
        .check_job(&JobRequirements {
            model_id: "claude-opus-5".into(),
            source: ModelSource::Hosted,
            input_tokens: 10_000,
            needs_image_input: true,
            needs_tools: true,
        })
        .unwrap_err();
    assert!(matches!(hosted_opus, CapabilityError::ModelUnavailable(_)));

    let byok_opus = reg
        .check_job(&JobRequirements {
            model_id: "claude-opus-5".into(),
            source: ModelSource::ApiProvider(ApiKeyStatus::from_secret(
                "Anthropic",
                "key-1234",
                None,
            )),
            input_tokens: 10_000,
            needs_image_input: true,
            needs_tools: true,
        })
        .expect("Opus 5 allowed with BYOK");
    assert!(!byok_opus.touches_ledger);
}

#[test]
fn capability_checks_reject_missing_image_tools_rate_card_and_offline_source() {
    let reg = CapabilityRegistry::new(vec![ModelCapability {
        id: "text-only".into(),
        name: "Text Only".into(),
        provider: "Test".into(),
        context_tokens: 32_000,
        max_output_tokens: 4_000,
        image_input: false,
        tools: false,
        price: None,
        availability: ModelAvailability::Available,
    }]);

    assert!(matches!(
        reg.check_job(&JobRequirements {
            model_id: "text-only".into(),
            source: ModelSource::Hosted,
            input_tokens: 1_000,
            needs_image_input: true,
            needs_tools: false,
        }),
        Err(CapabilityError::ImageInputUnsupported(_))
    ));

    assert!(matches!(
        reg.check_job(&JobRequirements {
            model_id: "text-only".into(),
            source: ModelSource::Hosted,
            input_tokens: 1_000,
            needs_image_input: false,
            needs_tools: true,
        }),
        Err(CapabilityError::ToolsUnsupported(_))
    ));

    // Hosted without a rate card is rejected; Local CLI ready without a rate card is allowed.
    assert!(matches!(
        reg.check_job(&JobRequirements {
            model_id: "text-only".into(),
            source: ModelSource::Hosted,
            input_tokens: 1_000,
            needs_image_input: false,
            needs_tools: false,
        }),
        Err(CapabilityError::MissingRateCard(_))
    ));

    assert!(matches!(
        reg.check_job(&JobRequirements {
            model_id: "text-only".into(),
            source: ModelSource::LocalCli(LocalCliSource {
                status: ConnectorStatus::Offline,
                connector_addr: None,
                agent: None,
            }),
            input_tokens: 1_000,
            needs_image_input: false,
            needs_tools: false,
        }),
        Err(CapabilityError::SourceNotReady(ModelSourceKind::LocalCli))
    ));

    let cli_ok = reg
        .check_job(&JobRequirements {
            model_id: "text-only".into(),
            source: ModelSource::LocalCli(LocalCliSource {
                status: ConnectorStatus::Ready,
                connector_addr: Some("127.0.0.1:47821".into()),
                agent: Some("Codex CLI".into()),
            }),
            input_tokens: 1_000,
            needs_image_input: false,
            needs_tools: false,
        })
        .expect("ready Local CLI does not need Hosted rate card");
    assert!(!cli_ok.touches_ledger);

    let priced = PricePerUnit {
        rate_card: "rc-7".into(),
        input_per_1k_micro_credits: 300,
        output_per_1k_micro_credits: 1500,
        unit: "micro-credits / 1k tokens".into(),
    };
    assert_eq!(priced.rate_card, "rc-7");
}
