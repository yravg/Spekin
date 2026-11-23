# 0008 · Persistence: Postgres behind a storage trait

Status: accepted (owner, 23 Nov 2026, approving the lead's recommendation)

## Context
The server keeps all state in memory, seeded from `fixtures/meranti-yard.json`. The PRD (§16.2, R-ARC-3) makes the server authoritative and names an audited Postgres client. Reload, cross-session conflict (S35) and the audit log need durable state.

## Decision
- `crates/spekin-core` defines a `Store` trait (projects, stages, revisions, proposals, ledger entries, skills and versions, audit entries, deleted projects). The core stays pure: no database code in it.
- Two implementations: `MemoryStore` (today's behaviour, used by tests and the sample) and `PgStore` in a new crate `spekin-store-pg`, using `sqlx` (MIT/Apache-2.0) with plain SQL migrations under `crates/spekin-store-pg/migrations`. No ORM, no Python.
- The server picks `PgStore` when `DATABASE_URL` is set, otherwise `MemoryStore`. Seeding the sample is an explicit command, never automatic against a real database.
- The audit log stays append-only and hash-chained; its head is stored apart from the entries (IMP-31/35).
- Postgres tests run only with `TEST_DATABASE_URL`; without it the gate says the stage was skipped, never passed.

## Consequences
Local use needs no database. Hosting needs Postgres 16+. Concurrency on revisions uses row locks; the S35 conflict state comes from the store, not the client.
