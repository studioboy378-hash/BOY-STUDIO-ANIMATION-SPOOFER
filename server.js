'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const MAX_BYTES = 8 * 1024 * 1024;
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;
const hits = new Map();

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}
function limited(ip) {
  const now = Date.now();
  const entry = hits.get(ip) || { start: now, count: 0 };
  if (now - entry.start > WINDOW_MS) { entry.start = now; entry.count = 0; }
  entry.count++;
  hits.set(ip, entry);
  return entry.count > MAX_REQUESTS;
}
async function readAnimation(id, res) {
  if (!/^\d{5,25}$/.test(id || '')) return send(res, 400, JSON.stringify({ error: 'Animation ID tidak valid.' }));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const upstream = await fetch(`https://assetdelivery.roblox.com/v1/asset/?id=${encodeURIComponent(id)}`, {
      redirect: 'follow', signal: controller.signal,
      headers: { 'Accept': 'application/xml,text/xml,application/octet-stream,*/*', 'User-Agent': 'BOY-STUDIO-Animation-Parser/1.0' }
    });
    if (!upstream.ok) return send(res, upstream.status, JSON.stringify({ error: `Roblox Asset Delivery merespons HTTP ${upstream.status}. Aset mungkin tidak tersedia atau tidak dapat diakses.` }));
    const declared = Number(upstream.headers.get('content-length') || 0);
    if (declared > MAX_BYTES) return send(res, 413, JSON.stringify({ error: 'Ukuran aset melebihi batas 8 MB.' }));
    const bytes = Buffer.from(await upstream.arrayBuffer());
    if (!bytes.length) return send(res, 502, JSON.stringify({ error: 'Roblox mengembalikan aset kosong.' }));
    if (bytes.length > MAX_BYTES) return send(res, 413, JSON.stringify({ error: 'Ukuran aset melebihi batas 8 MB.' }));
    const body = bytes.toString('utf8').replace(/^\uFEFF/, '').trim();
    if (!body.startsWith('<?xml') && !body.startsWith('<roblox') && !body.startsWith('<!DOCTYPE')) {
      return send(res, 415, JSON.stringify({ error: 'Aset berhasil diunduh, tetapi bukan XML KeyframeSequence yang dapat dibaca. Endpoint tidak mengubah binary menjadi keyframe.' }));
    }
    if (!body.includes('KeyframeSequence') || !body.includes('Keyframe')) {
      return send(res, 415, JSON.stringify({ error: 'Respons XML tidak berisi KeyframeSequence yang dikenali.' }));
    }
    send(res, 200, body, 'application/xml; charset=utf-8');
  } catch (error) {
    const message = error.name === 'AbortError' ? 'Permintaan ke Roblox melewati batas waktu.' : 'Tidak dapat mengambil aset dari Roblox: ' + error.message;
    send(res, 502, JSON.stringify({ error: message }));
  } finally { clearTimeout(timeout); }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });
    return res.end();
  }
  if (req.method === 'GET' && url.pathname === '/api/animation') {
    const ip = req.socket.remoteAddress || 'unknown';
    if (limited(ip)) return send(res, 429, JSON.stringify({ error: 'Terlalu banyak permintaan. Coba lagi sebentar.' }));
    return readAnimation(url.searchParams.get('id'), res);
  }
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'));
    return send(res, 200, html, 'text/html; charset=utf-8');
  }
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, JSON.stringify({ ok: true, service: 'BOY STUDIO Animation Spoofer' }));
  return send(res, 404, JSON.stringify({ error: 'Not found' }));
});
server.listen(PORT, '0.0.0.0', () => console.log(`BOY STUDIO Animation Spoofer aktif di http://localhost:${PORT}`));
