'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { parseWallets, scanWallets, expandEns } = require('./scan');

const PORT = process.env.PORT || 3000;
const PUBLIC = path.join(__dirname, '..', 'public');
const hits = new Map(); // ip -> [timestamps]; in-memory only
function limited(ip) {
  const now = Date.now(), arr = (hits.get(ip) || []).filter(t => now - t < 60000);
  arr.push(now); hits.set(ip, arr); return arr.length > 10; // 10 scans/min/IP
}
const HEADERS = {
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; base-uri 'none'; form-action 'none'",
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
};
function send(res, code, body, type = 'application/json') {
  res.writeHead(code, { 'Content-Type': type, ...HEADERS });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/healthz') return send(res, 200, { ok: true });
  // PRIVACY: addresses are never logged or stored.
  if (req.method === 'POST' && req.url === '/api/scan') {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
    if (limited(ip)) return send(res, 429, { error: 'Too many scans. Wait a minute.' });
    let body = '';
    req.on('data', d => { body += d; if (body.length > 20000) req.destroy(); });
    req.on('end', async () => {
      try {
        const { wallets: input } = JSON.parse(body || '{}');
        const ens = await expandEns(input);
        const { wallets, invalid } = parseWallets(ens.text);
        invalid.push(...ens.unresolved);
        if (!wallets.length) return send(res, 400, { error: 'No valid 0x addresses found.', invalid });
        const result = await scanWallets(wallets);
        send(res, 200, { ...result, invalid });
      } catch (e) { send(res, 400, { error: String(e.message) }); }
    });
    return;
  }
  if (req.method === 'GET') {
    const file = req.url === '/' ? 'index.html' : req.url.split('?')[0].replace(/^\/+/, '');
    const full = path.join(PUBLIC, file);
    if (!full.startsWith(PUBLIC + path.sep) || !fs.existsSync(full)) return send(res, 404, 'Not found', 'text/plain');
    const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(full)] || 'text/plain';
    return send(res, 200, fs.readFileSync(full), type);
  }
  send(res, 405, { error: 'Method not allowed' });
});
if (require.main === module) server.listen(PORT, () => console.log(`ClaimScout on http://localhost:${PORT}`));
module.exports = server;
