// Minimal static file server for local preview.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5252;
const TYPES = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript',
  '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png',
  '.ico':'image/x-icon', '.woff2':'font/woff2', '.map':'application/json' };

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (p === '/' ) p = '/index.html';
    const file = normalize(join(ROOT, p));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type':'text/html' }).end('<h1>404</h1>');
  }
}).listen(PORT, () => console.log(`Prism AI preview → http://localhost:${PORT}`));
