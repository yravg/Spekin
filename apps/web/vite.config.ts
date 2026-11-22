import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// The sample data and the design CSS live in the repo outside apps/web (one source with the canvas).
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
// SPK_WEB_PORT lets two worktrees run side by side (e.g. 5174); point the harness at it with APP_URL.
const port = Number(process.env.SPK_WEB_PORT || 5173);

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port, strictPort: true, fs: { allow: [repoRoot] }, proxy: { '/api': 'http://127.0.0.1:8787' } },
  preview: { host: '127.0.0.1', port, strictPort: true },
});
