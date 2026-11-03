/*
 * umaira-websearch.js
 * Sisi klien pencarian web: panggil /api/search, bangun konteks prompt
 * dengan nomor sumber, dan tampilkan daftar sumber di bawah jawaban.
 *
 *   const { system, sources } = webOn
 *     ? await UmairaWebSearch.buildContext(userText)
 *     : { system: '', sources: [] };
 *   // tambahkan `system` ke system prompt, lalu setelah jawaban tampil:
 *   bubbleEl.insertAdjacentHTML('beforeend', UmairaWebSearch.sourcesHTML(sources));
 */
(function () {
  const ENDPOINT = '/api/search';
  const TRIGGERS = /\b(terbaru|terkini|hari ini|sekarang|saat ini|minggu ini|bulan ini|tahun ini|kemarin|besok|berita|harga|kurs|cuaca|skor|jadwal|rilis|update|trending|cari di (?:web|internet)|carikan|siapa (?:presiden|ceo)|202\d)\b/i;

  // Heuristik ringan untuk mode "otomatis": cari hanya jika pertanyaan tampak butuh data terkini.
  const shouldSearch = (text) => TRIGGERS.test(text);

  async function search(query) {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Pencarian gagal.');
    return data.results || [];
  }

  async function buildContext(question) {
    let results = [];
    try { results = await search(question); } catch (e) { return { system: '', sources: [], error: e.message }; }
    if (!results.length) return { system: '', sources: [] };
    const today = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeZone: 'Asia/Jakarta' }).format(new Date());
    const body = results.map((r, i) => '[' + (i + 1) + '] ' + r.title + ' (' + r.url + ')\n' + r.content).join('\n\n');
    const system =
      '\n\nHasil pencarian web (per ' + today + '). Gunakan untuk menjawab dan sebut sumber dengan nomor [1], [2]. ' +
      'Jika hasilnya tidak cukup atau saling bertentangan, katakan apa adanya. Jangan mengarang di luar hasil ini.\n\n' + body;
    return { system, sources: results.map((r, i) => ({ n: i + 1, title: r.title, url: r.url })) };
  }

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const host = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } };
  const safe = (u) => (/^https?:\/\//i.test(u) ? esc(u) : '#');

  function sourcesHTML(sources) {
    if (!sources || !sources.length) return '';
    return '<div class="web-sources" style="margin-top:8px;font-size:12px"><div style="opacity:.6;margin-bottom:2px">Sumber web</div>' +
      sources.map((s) => '<div>[' + s.n + '] <a href="' + safe(s.url) + '" target="_blank" rel="noopener noreferrer">' +
        esc(s.title) + '</a> <span style="opacity:.6">· ' + esc(host(s.url)) + '</span></div>').join('') + '</div>';
  }

  window.UmairaWebSearch = { search, buildContext, sourcesHTML, shouldSearch };
})();
