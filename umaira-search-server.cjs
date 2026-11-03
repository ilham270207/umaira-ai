/*
 * umaira-search-server.js  (Node 18+, Express)
 * Proxy pencarian web agar API key tidak bocor ke browser.
 *
 * Pasang di server Anda:
 *   const express = require('express');
 *   const app = express();
 *   app.use(express.json());
 *   app.use('/api', require('./umaira-search-server'));
 *
 * Jalankan dengan environment variable:
 *   TAVILY_API_KEY=tvly-xxxxx node server.js
 *
 * Penyedia lain (Brave, SerpAPI, dll.) bisa dipakai: ganti isi fungsi searchProvider().
 */
const express = require('express');
const router = express.Router();

const MAX_QUERY = 300;
const hits = new Map(); // pembatas sederhana: 20 permintaan / menit / IP
function limited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 20;
}

async function searchProvider(query, max) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) throw Object.assign(new Error('TAVILY_API_KEY belum diatur di server.'), { status: 500 });
  const r = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({ query, max_results: max, search_depth: 'basic' }),
  });
  if (!r.ok) throw Object.assign(new Error('Penyedia pencarian error (' + r.status + ').'), { status: 502 });
  const data = await r.json();
  return (data.results || []).map((x) => ({
    title: x.title,
    url: x.url,
    content: String(x.content || '').slice(0, 700),
  }));
}

router.post('/search', async (req, res) => {
  try {
    if (limited(req.ip)) return res.status(429).json({ error: 'Terlalu banyak pencarian. Coba lagi sebentar.' });
    const query = String((req.body && req.body.query) || '').trim().slice(0, MAX_QUERY);
    if (!query) return res.status(400).json({ error: 'Kata kunci kosong.' });
    const results = await searchProvider(query, 5);
    res.json({ query, results });
  } catch (e) {
    res.status(e.status || 500).json({ error: e.message || 'Pencarian gagal.' });
  }
});

module.exports = router;
