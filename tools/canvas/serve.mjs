// Serves the canvas boards locally so any agent can open them: node tools/canvas/serve.mjs  -> http://127.0.0.1:5180/Main.dc.html
// The claude.ai canvas link is the owner's view only; these files are the real source.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = fileURLToPath(new URL('../../docs/design/spekin-canvas/project', import.meta.url));
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.json': 'application/json' };
const port = Number(process.env.PORT || 5180);
http.createServer((q, r) => {
  const u = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(dir, u === '/' ? 'Main.dc.html' : u);
  if (!f.startsWith(dir)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end('not found'); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'text/plain' }); r.end(b); } });
}).listen(port, '127.0.0.1', () => console.log('boards: http://127.0.0.1:' + port + '/  (Main, F00-feature-map, S27..S38, T01)'));
