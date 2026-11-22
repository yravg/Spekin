# Security

## Reporting a problem

Please don't open a public issue for a security problem. Use GitHub's private vulnerability reporting on this repository (Security tab → Report a vulnerability). We aim to reply within 7 days.

## Rules for everyone working in this repo

- **No secrets in git.** API keys, tokens, passwords and `.env` files stay out. `npm run check:rules` blocks common key shapes. If you commit one by mistake, tell the owner at once: the key must be rotated, and deleting the commit is not enough.
- **No real client or personal data.** Boards, fixtures and tests use the fictional sample project (Meranti Yard) only.
- **Model keys stay server-side.** The browser never stores a provider key. Bring-your-own-key and bring-your-own-agent flows follow [ADR 0005](docs/adr/0005-model-sources.md).
- **Generated UI fails closed.** Anything a model returns is checked against a declared schema in Rust before the UI renders it (PRD AC-SPK-25). Unknown components, scripts, unsafe URLs and actions that raise privileges are rejected.
- **The preview is sandboxed.** Generated code runs only in a sandboxed iframe, never in the app's own origin.
- **No deployment, purchase or outside message from a build task.** Those need the owner's explicit approval.
