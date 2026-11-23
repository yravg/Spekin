//! IMP-42: the API on Postgres, end to end, over a real HTTP socket.
//!
//! Each test starts the real `spekin-server` binary with `DATABASE_URL` on a free
//! loopback port, seeded from the same fixture `seed-sample` uses, and exercises
//! the API over HTTP. The stage runs only when `TEST_DATABASE_URL` is set;
//! otherwise it prints "postgres stage skipped" and returns without claiming it
//! passed. The server process is stopped at the end of every test, even on
//! failure (the `ServerGuard` kills it on drop).

use std::process::{Child, Command};
use std::time::Duration;

use reqwest::StatusCode;
use serde_json::{Value, json};
use spekin_server::DEFAULT_NOW;
use spekin_server::seed::seed_from_fixture;
use spekin_store_pg::PgStore;
use tokio::sync::Mutex;

const SAMPLE: &str = include_str!("../../../fixtures/meranti-yard.json");

/// Serialise the two live tests: they share one database and both truncate/seed.
static LIVE_GUARD: Mutex<()> = Mutex::const_new(());

/// Kill the server process on drop, so a failing test never leaks it.
struct ServerGuard {
    child: Child,
}

impl Drop for ServerGuard {
    fn drop(&mut self) {
        let _ = self.child.kill();
        let _ = self.child.wait();
    }
}

fn free_port() -> u16 {
    let listener = std::net::TcpListener::bind("127.0.0.1:0").expect("bind free port");
    listener.local_addr().expect("local addr").port()
}

/// Connect to the test database, truncate and seed Meranti Yard (the same seed
/// `seed-sample` uses), and return the store so later rounds can reset it.
async fn seeded_store() -> PgStore {
    let url = std::env::var("TEST_DATABASE_URL").expect("TEST_DATABASE_URL is set");
    let store = PgStore::connect(&url)
        .await
        .expect("connect to TEST_DATABASE_URL");
    reset(&store).await;
    store
}

/// Truncate every table and re-seed Meranti Yard, resetting the revision back to
/// r14 so a later round can accept the proposal again.
async fn reset(store: &PgStore) {
    store.truncate().await.expect("truncate the test database");
    let (project_id, seed) =
        seed_from_fixture(SAMPLE, DEFAULT_NOW).expect("sample fixture is valid");
    store
        .seed(&project_id, &seed)
        .await
        .expect("seed the test database");
}

/// Start the real server binary on a free loopback port and wait for `/api/health`.
async fn start_server() -> (ServerGuard, reqwest::Client, String) {
    let url = std::env::var("TEST_DATABASE_URL").expect("TEST_DATABASE_URL is set");
    let port = free_port();
    let bind = format!("127.0.0.1:{port}");
    let child = Command::new(env!("CARGO_BIN_EXE_spekin-server"))
        .env("DATABASE_URL", &url)
        .env("SPEKIN_BIND", &bind)
        .spawn()
        .expect("spawn the server binary");

    let guard = ServerGuard { child };
    let client = reqwest::Client::new();
    let base = format!("http://{bind}");

    // Wait for the server to answer /api/health.
    let mut ready = false;
    for _ in 0..100 {
        if let Ok(resp) = client.get(format!("{base}/api/health")).send().await
            && resp.status().is_success()
        {
            ready = true;
            break;
        }
        tokio::time::sleep(Duration::from_millis(100)).await;
    }
    assert!(ready, "server did not become healthy on {base}");

    (guard, client, base)
}

fn accept_url(base: &str) -> String {
    format!("{base}/api/projects/meranti-yard/proposals/P-07/accept")
}

// --- Item 2: the sequential smoke test ---

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn live_server_smoke_end_to_end() {
    let Ok(_) = std::env::var("TEST_DATABASE_URL") else {
        println!("postgres stage skipped (TEST_DATABASE_URL is not set)");
        return;
    };
    let _guard = LIVE_GUARD.lock().await;

    seeded_store().await;
    let (_server, client, base) = start_server().await;

    // health
    let resp = client
        .get(format!("{base}/api/health"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    assert_eq!(resp.text().await.unwrap(), "ok");

    // project
    let resp = client
        .get(format!("{base}/api/projects/meranti-yard"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let project: Value = resp.json().await.unwrap();
    assert_eq!(project["name"], "Meranti Yard");

    // stages
    let resp = client
        .get(format!("{base}/api/projects/meranti-yard/stages"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let stages: Value = resp.json().await.unwrap();
    assert!(
        !stages.as_array().expect("stages is an array").is_empty(),
        "stages are seeded"
    );

    // accept -> r15
    let resp = client.post(accept_url(&base)).send().await.unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let rev: Value = resp.json().await.unwrap();
    assert_eq!(rev["n"], 15);
    assert!(rev["content"].as_str().unwrap().contains("R-DASH-019"));

    // the same accept again -> 409 proposal_stale
    let resp = client.post(accept_url(&base)).send().await.unwrap();
    assert_eq!(resp.status(), StatusCode::CONFLICT);
    let body: Value = resp.json().await.unwrap();
    assert_eq!(body["code"], "proposal_stale");

    // reject
    let resp = client
        .post(format!(
            "{base}/api/projects/meranti-yard/proposals/P-07/reject"
        ))
        .json(&json!({ "reason": "Threshold should be 5%." }))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    // revert spec back to r14 content -> r16
    let resp = client
        .post(format!(
            "{base}/api/projects/meranti-yard/revisions/spec/revert"
        ))
        .json(&json!({ "to": { "n": 14, "content": "r14 content restored" } }))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let rev: Value = resp.json().await.unwrap();
    assert_eq!(rev["n"], 16);
    assert_eq!(rev["content"], "r14 content restored");

    // reserve and settle
    let resp = client
        .post(format!("{base}/api/projects/meranti-yard/runs/reserve"))
        .json(&json!({
            "run_id": "run-0429",
            "person_id": "user-enrico",
            "idempotency_key": "k-7f3c91",
            "estimate": { "min": 18, "max": 30, "reserve": 36 }
        }))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    let resp = client
        .post(format!("{base}/api/projects/meranti-yard/runs/settle"))
        .json(&json!({ "run_id": "run-0429", "actual": 24 }))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let settle: Value = resp.json().await.unwrap();
    assert_eq!(settle["charged"], 24);
    assert_eq!(settle["refunded"], 12);

    // audit: the chain verifies
    let resp = client
        .get(format!("{base}/api/projects/meranti-yard/audit"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let audit: Value = resp.json().await.unwrap();
    assert_eq!(audit["error"], Value::Null, "the audit chain verifies");
    let entries = audit["entries"].as_array().expect("entries is an array");
    assert_eq!(entries.len(), 5, "accept, reject, revert, reserve, settle");

    // deleted projects and restore
    let resp = client
        .get(format!("{base}/api/projects/deleted"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let deleted: Value = resp.json().await.unwrap();
    assert!(
        !deleted.as_array().expect("deleted is an array").is_empty(),
        "the seeded deleted project is listed"
    );

    let resp = client
        .post(format!("{base}/api/projects/meranti-yard/delete"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);

    let resp = client
        .post(format!("{base}/api/projects/meranti-yard/restore"))
        .send()
        .await
        .unwrap();
    assert_eq!(resp.status(), StatusCode::OK);
    let restored: Value = resp.json().await.unwrap();
    assert_eq!(restored["id"], "meranti-yard");
    assert!(restored["deleted_at"].is_null());
}

// --- Item 3: two concurrent accepts, exactly one 200 and one 409, x20 ---

#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn two_concurrent_http_accepts_one_winner_20_rounds() {
    let Ok(_) = std::env::var("TEST_DATABASE_URL") else {
        println!("postgres stage skipped (TEST_DATABASE_URL is not set)");
        return;
    };
    let _guard = LIVE_GUARD.lock().await;

    let store = seeded_store().await;
    let (_server, client, base) = start_server().await;

    for round in 0..20 {
        reset(&store).await;

        let url = accept_url(&base);
        let (ra, rb) = tokio::join!(
            client.post(url.clone()).send(),
            client.post(url.clone()).send(),
        );
        let ra = ra.expect("accept request a");
        let rb = rb.expect("accept request b");

        let (sa, sb) = (ra.status(), rb.status());
        let ba: Value = ra.json().await.expect("body a");
        let bb: Value = rb.json().await.expect("body b");

        let statuses = [sa, sb];
        let ok = statuses.iter().filter(|s| **s == StatusCode::OK).count();
        let conflict = statuses
            .iter()
            .filter(|s| **s == StatusCode::CONFLICT)
            .count();
        assert_eq!(
            (ok, conflict),
            (1, 1),
            "round {round}: exactly one 200 and one 409, got {sa} {sb}"
        );

        // The winner advanced to r15; the loser is a typed stale conflict.
        let (winner, loser) = if sa == StatusCode::OK {
            (&ba, &bb)
        } else {
            (&bb, &ba)
        };
        assert_eq!(winner["n"], 15, "round {round}: winner advances to r15");
        assert_eq!(
            loser["code"], "proposal_stale",
            "round {round}: loser is stale"
        );
    }
}
