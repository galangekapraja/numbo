#!/usr/bin/env node
/* Tiny static server for dist/ (no dependencies): npm run serve  ->  http://localhost:8080 */
const http = require('http'), fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'dist');
const port = +process.env.PORT || 8080;
http.createServer((req, res) => {
  const f = path.join(dir, req.url === '/' ? 'index.html' : decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(dir) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('Not found'); }
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml' };
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(port, () => console.log('Numbo on http://localhost:' + port));
