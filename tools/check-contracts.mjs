// The TypeScript contract types are generated from Rust (ts-rs, during cargo test). Fails when they are not committed.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const out = execFileSync('git', ['status', '--porcelain', '--', 'packages/contracts/src/generated'], { cwd: ROOT, encoding: 'utf8' });
if (out.trim()) { console.log('Generated contract types changed. Run cargo test --workspace and commit packages/contracts/src/generated:\n' + out); process.exit(1); }
console.log('contracts current');
