const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 6767;
const ROOT = __dirname;
const MAIN_HTML = path.join(ROOT, 'index.html');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json'
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  let rawPath = req.url.split('?')[0];
  let decodedPath = '';
  try {
    decodedPath = decodeURIComponent(rawPath);
  } catch (e) {
    decodedPath = rawPath;
  }

  let filePath = MAIN_HTML;

  if (decodedPath === '/' || decodedPath === '/index.html' || decodedPath === '' || decodedPath === '/cosmos') {
    filePath = MAIN_HTML;
  } else {
    const candidate = path.normalize(path.join(ROOT, decodedPath.replace(/^\//, '')));
    if (candidate.startsWith(ROOT) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      filePath = candidate;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + decodedPath);
      return;
    }
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error: ' + err.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  SSJ COSMOS - Open World Simulator Server`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`====================================================`);
});
