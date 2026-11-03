(function () {
'use strict';
if (window.__uvSuper) return;
window.__uvSuper = true;

var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
var norm = function (s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); };
var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
var LS = {
get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
};
var pad = function (n) { return ('0' + n).slice(-2); };
var today = function () { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
var SECRET = /token|auth|session|jwt|secret|password|cookie/i;
var setText = function (e, t) { if (e.textContent !== t) e.textContent = t; };
var setHTML = function (e, h) { if (e.__h !== h) { e.innerHTML = h; e.__h = h; } };
var hash = function (s) { var h = 5381; s = String(s); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return 'g' + (h >>> 0).toString(36); };

var P = {
search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>',
save: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
palette: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18z"/>',
chart: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
kbd: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10"/>',
bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
bolt: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
pin: '<path d="M12 17v5"/><path d="M9 3h6l-1 6 4 4H6l4-4z"/>',
folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
heart: '<path d="M12 21s-8-5.2-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.8-8 11-8 11z"/>',
tag: '<path d="M20 12 12 20l-9-9V3h8z"/><circle cx="7.5" cy="7.5" r="1"/>',
spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
x: '<path d="M18 6 6 18M6 6l12 12"/>',
grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
up: '<path d="m18 15-6-6-6 6"/>',
down: '<path d="m6 9 6 6 6-6"/>',
};
function ic(n, s, fill) { return '<svg viewBox="0 0 24 24" width="' + (s || 18) + '" height="' + (s || 18) + '" fill="' + (fill ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + P[n] + '</svg>'; }

function toast(m, t) { if (window.UmairaNotify) window.UmairaNotify.toast(m, t); }
function confirmUI(msg, yes) { if (window.UmairaNotify && window.UmairaNotify.confirm) window.UmairaNotify.confirm(msg, yes); else yes(); }
function setVal(el, v) {
if (!el) return;
var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
var d = Object.getOwnPropertyDescriptor(proto, 'value');
if (d && d.set) d.set.call(el, v); else el.value = v;
el.dispatchEvent(new Event('input', { bubbles: true }));
el.focus();
}
function go(view) { var b = $('.nav-item[data-view="' + view + '"]') || $('[data-view="' + view + '"]'); if (b) { b.click(); return true; } return false; }
async function getJSON(p) { try { var r = await fetch(p); if (!r.ok) return null; return await r.json(); } catch (e) { return null; } }
function listOf(d) {
if (Array.isArray(d)) return d;
if (d && typeof d === 'object') {
var keys = ['items', 'tasks', 'files', 'chats', 'workspaces', 'projects', 'value', 'data'];
for (var i = 0; i < keys.length; i++) { var v = d[keys[i]]; if (Array.isArray(v)) return v; if (v && typeof v === 'object') { var inner = listOf(v); if (inner.length) return inner; } }
var vals = Object.keys(d).map(function (k) { return d[k]; });
for (var j = 0; j < vals.length; j++) if (Array.isArray(vals[j])) return vals[j];
}
return [];
}
function titleOf(it) {
if (typeof it === 'string') return it;
if (!it || typeof it !== 'object') return '';
var ks = ['title', 'name', 'label', 'prompt', 'text', 'content', 'message', 'caption'];
for (var i = 0; i < ks.length; i++) if (typeof it[ks[i]] === 'string' && it[ks[i]].trim()) return it[ks[i]].trim();
var any = Object.keys(it).find(function (k) { return typeof it[k] === 'string' && it[k].trim(); });
return any ? it[any] : '';
}
function dateOf(it) {
if (!it || typeof it !== 'object') return null;
var ks = Object.keys(it);
for (var i = 0; i < ks.length; i++) {
if (!/(creat|updat|date|time|^at$|^ts$)/i.test(ks[i])) continue;
var v = it[ks[i]], d = null;
if (typeof v === 'number') d = new Date(v < 1e12 ? v * 1000 : v);
else if (typeof v === 'string') d = new Date(v);
if (d && !isNaN(d) && d.getFullYear() > 2000) return d;
}
return null;
}

var css = [
'.uv2-ui{--b:rgba(128,128,128,.3)}',
'#uv2-center{position:fixed;inset:0;z-index:99997;display:none;flex-direction:column;background:var(--uvbg,#fbfbfd);color:var(--uvfg,#1a1a2e)}',
'#uv2-center .uv2-head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;font-size:17px;font-weight:600}',
'#uv2-center .uv2-tabs{display:flex;gap:6px;overflow-x:auto;padding:0 14px 10px;scrollbar-width:none}',
'#uv2-center .uv2-body{flex:1;overflow:auto;padding:0 14px 24px;max-width:680px;width:100%;box-sizing:border-box;margin:0 auto}',
'.uv2-btn{font:inherit;font-size:12.5px;padding:7px 13px;border-radius:999px;border:1px solid var(--b,rgba(128,128,128,.3));background:rgba(255,255,255,.7);color:inherit;cursor:pointer;display:inline-flex;align-items:center;gap:6px;white-space:nowrap}',
'.uv2-btn.on{background:#6366f1;color:#fff;border-color:#6366f1}',
'.uv2-btn.dg{color:#dc2626}',
'.uv2-in{font:inherit;font-size:14px;width:100%;box-sizing:border-box;padding:10px 12px;border-radius:12px;border:1px solid var(--b,rgba(128,128,128,.3));background:rgba(255,255,255,.8);color:inherit;margin-bottom:8px}',
'.uv2-card{max-width:760px;width:100%;box-sizing:border-box;border:1px solid var(--b,rgba(128,128,128,.3));border-radius:14px;padding:14px;margin:10px 0;background:rgba(255,255,255,.55);color:inherit}',
'.uv2-card h3{margin:0 0 4px;font-size:15px;font-weight:600}',
'.uv2-d{font-size:12px;opacity:.7;margin:0 0 10px;line-height:1.5}',
'.uv2-row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0;align-items:center}',
'.uv2-item{display:flex;align-items:center;gap:8px;font-size:13px;padding:7px 0;border-bottom:1px solid rgba(128,128,128,.15)}',
'.uv2-item>span{flex:1;word-break:break-word}',
'.uv2-m{font-size:11.5px;opacity:.6;margin-top:6px}',
'.uv2-res .uv2-r{display:block;width:100%;text-align:left;font:inherit;padding:10px 12px;margin-bottom:6px;border-radius:12px;border:1px solid var(--b,rgba(128,128,128,.3));background:rgba(255,255,255,.6);color:inherit;cursor:pointer}',
'.uv2-r small{display:inline-block;font-size:10.5px;padding:1px 8px;border-radius:999px;background:rgba(99,102,241,.15);color:#6366f1;margin-right:6px}',
'.uv2-big{font-size:54px;font-weight:600;text-align:center;font-variant-numeric:tabular-nums;margin:8px 0}',
'.uv2-bars{display:flex;align-items:flex-end;gap:8px;height:110px;margin:10px 0 4px}',
'.uv2-bars>div{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:10.5px}',
'.uv2-bars i{display:block;width:100%;border-radius:6px 6px 2px 2px;background:#6366f1;min-height:2px}',
'.uv2-bars i.b2{background:#a78bfa}',
'.uv2-bar2{display:flex;gap:3px;align-items:flex-end;width:100%;height:84px}',
'.uv2-kbd{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:7px 0;border-bottom:1px solid rgba(128,128,128,.15)}',
'.uv2-kbd kbd{font:inherit;font-size:11.5px;padding:2px 8px;border-radius:6px;border:1px solid var(--b,rgba(128,128,128,.4))}',
'#uv2-slash{position:fixed;z-index:99996;display:none;max-height:240px;overflow:auto;border-radius:14px;border:1px solid rgba(128,128,128,.3);background:var(--uvbg,#fff);color:var(--uvfg,#1a1a2e);box-shadow:0 12px 32px rgba(0,0,0,.25)}',
'#uv2-slash div{padding:9px 12px;font-size:13px;cursor:pointer;border-bottom:1px solid rgba(128,128,128,.12)}',
'#uv2-slash div.on{background:rgba(99,102,241,.15)}#uv2-slash b{margin-right:6px}#uv2-slash span{opacity:.65}',
'#uv2-find{position:fixed;top:56px;right:10px;z-index:99995;display:none;align-items:center;gap:6px;padding:7px 8px;border-radius:14px;border:1px solid rgba(128,128,128,.35);background:var(--uvbg,#fff);color:var(--uvfg,#1a1a2e);box-shadow:0 8px 24px rgba(0,0,0,.2)}',
'#uv2-find input{font:inherit;font-size:13px;width:150px;padding:6px 8px;border-radius:8px;border:1px solid rgba(128,128,128,.3);background:transparent;color:inherit}',
'#uv2-find button,#uv2-fab{font:inherit;border:0;background:transparent;color:inherit;cursor:pointer;display:inline-flex;padding:4px}',
'#uv2-fab{position:fixed;right:12px;bottom:140px;z-index:9000;width:40px;height:40px;border-radius:50%;align-items:center;justify-content:center;background:var(--uvbg,#fff);color:#6366f1;border:1px solid rgba(128,128,128,.35)!important;box-shadow:0 4px 14px rgba(0,0,0,.18);display:none}',
'mark.uv-hl{background:#fde68a;color:#111;border-radius:3px;padding:0 1px}mark.uv-hl.cur{background:#fb923c}',
'.uv2-chip{position:fixed;top:10px;right:10px;z-index:99994;display:none;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;font-size:13px;font-variant-numeric:tabular-nums;background:#6366f1;color:#fff;cursor:pointer;box-shadow:0 6px 18px rgba(99,102,241,.45)}',
'#uv2-ask{position:fixed;inset:0;z-index:100002;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(10,10,20,.45)}',
'#uv2-ask .bx{width:min(360px,100%);box-sizing:border-box;border-radius:20px;padding:18px;background:var(--uvbg,#fff);color:var(--uvfg,#1a1a2e);border:1px solid rgba(128,128,128,.3)}',
'.uv2-hid{display:none!important}',
'.uv2-tags{position:absolute;left:8px;top:8px;z-index:3;display:flex;gap:4px;flex-wrap:wrap;max-width:60%;pointer-events:none}',
'.uv2-tags span{font-size:10.5px;padding:2px 8px;border-radius:999px;background:rgba(15,15,25,.6);color:#fff}',
'.uv-ibtn.uv2-on{color:#f43f5e!important}',
'.uv2-frow{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0}',
'.uv2-pin{position:absolute;right:4px;top:50%;transform:translateY(-50%);display:inline-flex;gap:2px}',
'.uv2-pin button{border:0;background:transparent;color:inherit;opacity:.55;cursor:pointer;padding:3px;display:inline-flex}',
'.uv2-pin button.on{opacity:1;color:#6366f1}',
'.uv2-fb{font-size:10px;padding:1px 7px;margin-left:6px;border-radius:999px;background:rgba(99,102,241,.15);color:#6366f1}',
'html[data-uv-dark]{filter:invert(1) hue-rotate(180deg);background:#fff}',
'html[data-uv-dark] img,html[data-uv-dark] video,html[data-uv-dark] canvas{filter:invert(1) hue-rotate(180deg)}',
].join('\n');
var st = document.createElement('style'); st.id = 'uv2-style'; st.textContent = css; document.head.appendChild(st);

function themeVars(el) {
var c = (getComputedStyle(document.body).color.match(/\d+/g) || [0, 0, 0]).map(Number);
var dark = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) > 140;
el.style.setProperty('--uvbg', dark ? '#1c1c26' : '#fbfbfd');
el.style.setProperty('--uvfg', dark ? '#f2f2f7' : '#1a1a2e');
}
function mk(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function btn(label, fn, cls, icon) { var b = mk('button', 'uv2-btn ' + (cls || ''), (icon ? ic(icon, 15) : '') + esc(label)); b.type = 'button'; b.addEventListener('click', fn); return b; }
function card(title, desc) { var c = mk('section', 'uv2-card uv2-ui'); c.innerHTML = '<h3>' + esc(title) + '</h3><p class="uv2-d">' + esc(desc) + '</p>'; return c; }

/* input teks kecil (tag, folder) */
function ask(title, hint, sugg, cb) {
var d = $('#uv2-ask');
if (!d) { d = mk('div'); d.id = 'uv2-ask'; d.className = 'uv2-ui'; document.body.appendChild(d); }
themeVars(d); d.style.display = 'flex';
d.innerHTML = '<div class="bx"><div style="font-weight:600;margin-bottom:8px">' + esc(title) + '</div><input class="uv2-in" type="text" placeholder="' + esc(hint) + '"><div class="uv2-row" id="uv2-sg"></div><div class="uv2-row" style="justify-content:flex-end"></div></div>';
var inp = $('input', d), sg = $('#uv2-sg', d), act = $('.uv2-row:last-child', d);
var close = function () { d.style.display = 'none'; d.innerHTML = ''; };
(sugg || []).forEach(function (s) { sg.appendChild(btn(s, function () { close(); cb(s); })); });
act.appendChild(btn('Batal', close));
act.appendChild(btn('Simpan', function () { var v = inp.value.trim(); close(); cb(v); }, 'on'));
inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var v = inp.value.trim(); close(); cb(v); } if (e.key === 'Escape') close(); });
d.onclick = function (e) { if (e.target === d) close(); };
setTimeout(function () { inp.focus(); }, 50);
}

var TH = LS.get('uv-theme', { mode: 'app', zoom: 1 });
function applyTheme() {
var dark = TH.mode === 'dark' || (TH.mode === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
if (dark) document.documentElement.setAttribute('data-uv-dark', ''); else document.documentElement.removeAttribute('data-uv-dark');
document.body.style.zoom = TH.zoom && TH.zoom !== 1 ? TH.zoom : '';
}
function saveTheme() { LS.set('uv-theme', TH); applyTheme(); }
function rTampil(c) {
var k = card('Tema & Ukuran Teks', 'Gelap membalik warna tampilan. Otomatis mengikuti mode gelap perangkatmu. Ukuran teks menyesuaikan seluruh halaman.');
var r1 = mk('div', 'uv2-row'), r2 = mk('div', 'uv2-row');
[['app', 'Bawaan'], ['dark', 'Gelap'], ['auto', 'Otomatis']].forEach(function (m) { r1.appendChild(btn(m[1], function () { TH.mode = m[0]; saveTheme(); rTampil(c); }, TH.mode === m[0] ? 'on' : '')); });
[[0.9, '90%'], [1, '100%'], [1.1, '110%'], [1.25, '125%']].forEach(function (z) { r2.appendChild(btn(z[1], function () { TH.zoom = z[0]; saveTheme(); rTampil(c); }, TH.zoom === z[0] ? 'on' : '')); });
k.appendChild(r1); k.appendChild(r2);
mount(c, k);
}
function mount(c, k) { var old = c.querySelector('[data-k="' + (k.getAttribute('data-k') || '') + '"]'); c.innerHTML = ''; c.appendChild(k); }

function download(name, text) {
var a = mk('a'); a.href = URL.createObjectURL(new Blob([text], { type: 'application/json' })); a.download = name;
document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
async function exportAll() {
var data = { app: 'umaira', version: 1, date: new Date().toISOString(), local: {}, server: {} };
try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (!SECRET.test(k)) data.local[k] = localStorage.getItem(k); } } catch (e) {}
var eps = { chats: '/api/wsdata/chats', files: '/api/wsdata/files', scheduled: '/api/wsdata/scheduled', workspaces: '/api/workspaces' };
for (var n in eps) { var d = await getJSON(eps[n]); if (d != null) data.server[n] = d; }
download('umaira-cadangan-' + today() + '.json', JSON.stringify(data));
toast('Cadangan berhasil dibuat', 'ok');
}
function rCadang(c) {
var k = card('Cadangan & Pemulihan', 'Unduh semua data (obrolan, berkas, tugas, proyek, serta data lokal seperti snippet, prompt, tag) ke satu berkas JSON. Pemulihan hanya mengembalikan data lokal perangkat; data server hanya disimpan sebagai arsip.');
var row = mk('div', 'uv2-row');
row.appendChild(btn('Cadangkan semua data', function () { exportAll(); }, 'on', 'save'));
var f = mk('input'); f.type = 'file'; f.accept = '.json,application/json'; f.style.display = 'none';
f.addEventListener('change', function () {
var file = f.files && f.files[0]; if (!file) return;
var rd = new FileReader();
rd.onload = function () {
var d; try { d = JSON.parse(rd.result); } catch (e) { return toast('Berkas bukan JSON yang valid', 'err'); }
if (!d || d.app !== 'umaira' || !d.local) return toast('Berkas ini bukan cadangan Umaira', 'err');
var keys = Object.keys(d.local).filter(function (x) { return !SECRET.test(x); });
confirmUI('Pulihkan ' + keys.length + ' data lokal dari cadangan? Data lokal dengan nama yang sama akan diganti.', function () {
keys.forEach(function (x) { try { localStorage.setItem(x, d.local[x]); } catch (e) {} });
toast('Data lokal dipulihkan. Memuat ulang…', 'ok'); setTimeout(function () { location.reload(); }, 900);
});
};
rd.readAsText(file); f.value = '';
});
row.appendChild(btn('Pulihkan dari berkas', function () { f.click(); }, '', 'save')); row.appendChild(f);
k.appendChild(row);
k.appendChild(mk('div', 'uv2-m', 'Kunci sesi dan token tidak ikut dicadangkan.'));
mount(c, k);
}

var IDX = { t: 0, items: [] };
async function buildIndex() {
if (Date.now() - IDX.t < 30000 && IDX.items.length) return IDX.items;
var src = [['/api/wsdata/chats', 'chat', 'Obrolan'], ['/api/wsdata/files', 'library', 'Berkas'], ['/api/wsdata/scheduled', 'scheduled', 'Tugas'], ['/api/workspaces', 'projects', 'Proyek']];
var out = [];
var res = await Promise.all(src.map(function (s) { return getJSON(s[0]); }));
res.forEach(function (d, i) {
listOf(d).forEach(function (it) { var raw = ''; try { raw = JSON.stringify(it); } catch (e) {} if (raw.length > 6000) raw = raw.slice(0, 6000); out.push({ type: src[i][2], view: src[i][1], title: titleOf(it) || '(tanpa judul)', hay: norm(raw) }); });
});
try {
for (var i = 0; i < localStorage.length; i++) {
var k = localStorage.key(i); if (SECRET.test(k) || /^uv-(theme|pomo|chatmeta)$/.test(k)) continue;
var v = localStorage.getItem(k) || ''; if (v.length > 20000) v = v.slice(0, 20000);
out.push({ type: 'Lokal', view: null, title: k.replace(/^uv-/, ''), hay: norm(v), raw: v });
}
} catch (e) {}
IDX = { t: Date.now(), items: out }; return out;
}
function snippet(it, q) {
var src = it.raw || it.title || ''; var i = norm(src).indexOf(q);
if (i < 0) return it.title.slice(0, 90);
return (i > 30 ? '…' : '') + src.slice(Math.max(0, i - 30), i + 70).replace(/\s+/g, ' ');
}
function rCari(c) {
c.innerHTML = '';
var inp = mk('input', 'uv2-in'); inp.type = 'text'; inp.placeholder = 'Cari obrolan, berkas, tugas, proyek, snippet…';
var res = mk('div', 'uv2-res'); c.appendChild(inp); c.appendChild(res);
var tm;
var run = async function () {
var q = norm(inp.value); if (q.length < 2) { res.innerHTML = '<div class="uv2-m">Ketik minimal 2 huruf.</div>'; return; }
res.innerHTML = '<div class="uv2-m">Mencari…</div>';
var items = await buildIndex();
var hit = items.filter(function (it) { return it.hay.indexOf(q) >= 0 || norm(it.title).indexOf(q) >= 0; }).slice(0, 30);
res.innerHTML = hit.length ? '' : '<div class="uv2-m">Tidak ada hasil.</div>';
hit.forEach(function (it) {
var b = mk('button', 'uv2-r', '<small>' + esc(it.type) + '</small><b>' + esc(it.title.slice(0, 60)) + '</b><div class="uv2-m">' + esc(snippet(it, q)) + '</div>'); b.type = 'button';
b.addEventListener('click', function () { closeCenter(); if (it.view) go(it.view); }); res.appendChild(b);
});
};
inp.addEventListener('input', function () { clearTimeout(tm); tm = setTimeout(run, 220); });
run(); setTimeout(function () { inp.focus(); }, 60);
}

var DUR = { work: 25, short: 5, long: 15 }, MN = { work: 'Fokus', short: 'Istirahat', long: 'Istirahat panjang' };
var PM = LS.get('uv-pomo', { mode: 'work', left: 1500, running: false, end: 0, done: {} });
var pSave = function () { LS.set('uv-pomo', PM); };
function beep() { try { var a = new (window.AudioContext || window.webkitAudioContext)(), o = a.createOscillator(), g = a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value = 880; g.gain.value = 0.15; o.start(); setTimeout(function () { o.stop(); a.close(); }, 600); } catch (e) {} }
function notify(t, b) { try { if ('Notification' in window && Notification.permission === 'granted') new Notification(t, { body: b }); } catch (e) {} }
function pLeft() { return PM.running ? Math.max(0, Math.round((PM.end - Date.now()) / 1000)) : PM.left; }
function pStart() { PM.end = Date.now() + PM.left * 1000; PM.running = true; pSave(); try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {} pUI(); }
function pPause() { PM.left = pLeft(); PM.running = false; pSave(); pUI(); }
function pMode(m) { PM.mode = m; PM.left = DUR[m] * 60; PM.running = false; pSave(); pUI(); }
function pTick() {
if (PM.running && pLeft() <= 0) {
PM.running = false;
if (PM.mode === 'work') { PM.done[today()] = (PM.done[today()] || 0) + 1; var n = PM.done[today()]; PM.mode = n % 4 === 0 ? 'long' : 'short'; toast('Sesi fokus selesai. Waktunya istirahat!', 'ok'); notify('Sesi fokus selesai', 'Waktunya istirahat.'); }
else { PM.mode = 'work'; toast('Istirahat selesai. Ayo fokus lagi!', 'info'); notify('Istirahat selesai', 'Ayo fokus lagi.'); }
PM.left = DUR[PM.mode] * 60; pSave(); beep();
}
pUI();
}
function fmt(s) { return pad(Math.floor(s / 60)) + ':' + pad(s % 60); }
var chip;
function pUI() {
$$('.uv2-ptime').forEach(function (e) { setText(e, fmt(pLeft())); });
$$('.uv2-pgo').forEach(function (e) { setText(e, PM.running ? 'Jeda' : 'Mulai'); });
$$('.uv2-pcount').forEach(function (e) { setText(e, 'Sesi fokus hari ini: ' + (PM.done[today()] || 0)); });
if (!chip) { chip = mk('div', 'uv2-chip uv2-ui', ''); chip.addEventListener('click', function () { openCenter('fokus'); }); document.body.appendChild(chip); }
var show = PM.running || PM.left < DUR[PM.mode] * 60;
chip.style.display = show ? 'inline-flex' : 'none';
setHTML(chip, ic('timer', 14) + '<span>' + esc(MN[PM.mode]) + ' ' + fmt(pLeft()) + '</span>');
}
function rPomo(c) {
var k = card('Pomodoro Fokus', 'Bekerja 25 menit, istirahat 5 menit, dan istirahat panjang tiap 4 sesi. Penghitung tetap berjalan walau panel ditutup.');
var r = mk('div', 'uv2-row');
['work', 'short', 'long'].forEach(function (m) { r.appendChild(btn(MN[m] + ' ' + DUR[m] + 'm', function () { pMode(m); rPomo(c); }, PM.mode === m ? 'on' : '')); });
k.appendChild(r); k.appendChild(mk('div', 'uv2-big uv2-ptime', fmt(pLeft())));
var r2 = mk('div', 'uv2-row'); r2.style.justifyContent = 'center';
var go1 = btn(PM.running ? 'Jeda' : 'Mulai', function () { if (PM.running) pPause(); else pStart(); }, 'on uv2-pgo');
r2.appendChild(go1); r2.appendChild(btn('Ulang', function () { pMode(PM.mode); }));
k.appendChild(r2); k.appendChild(mk('div', 'uv2-m uv2-pcount', '')); k.lastChild.style.textAlign = 'center';
mount(c, k); pUI();
}

var DAYS = [['Sen', 1], ['Sel', 2], ['Rab', 3], ['Kam', 4], ['Jum', 5], ['Sab', 6], ['Min', 0]];
function remCheck() {
var d = new Date(), hm = pad(d.getHours()) + ':' + pad(d.getMinutes()), key = today() + ' ' + hm;
var list = LS.get('uv-rem', []), ch = false;
list.forEach(function (r) { if (!r.paused && r.time === hm && r.days.indexOf(d.getDay()) >= 0 && r.last !== key) { r.last = key; ch = true; toast('Pengingat: ' + r.title, 'info'); notify('Pengingat Umaira', r.title); beep(); } });
if (ch) LS.set('uv-rem', list);
}
function rIngat(c) {
var k = card('Pengingat Berulang (lokal)', 'Pilih hari dan jam; bunyi dan notifikasi muncul selama tab Umaira terbuka. Tugas AI terjadwal dari server tetap di formulir bawaan.');
var t = mk('input', 'uv2-in'); t.type = 'text'; t.placeholder = 'Judul pengingat'; k.appendChild(t);
var tm = mk('input', 'uv2-in'); tm.type = 'time'; tm.value = '08:00'; k.appendChild(tm);
var sel = [1, 2, 3, 4, 5], rd = mk('div', 'uv2-row');
DAYS.forEach(function (d) { var b = btn(d[0], function () { var i = sel.indexOf(d[1]); if (i >= 0) sel.splice(i, 1); else sel.push(d[1]); b.classList.toggle('on', sel.indexOf(d[1]) >= 0); }, sel.indexOf(d[1]) >= 0 ? 'on' : ''); rd.appendChild(b); });
k.appendChild(rd);
var list = mk('div');
var render = function () {
var items = LS.get('uv-rem', []); list.innerHTML = items.length ? '' : '<div class="uv2-m">Belum ada pengingat.</div>';
items.forEach(function (r, i) {
var it = mk('div', 'uv2-item', '<span>' + esc(r.title) + '<div class="uv2-m">' + r.time + ' · ' + DAYS.filter(function (d) { return r.days.indexOf(d[1]) >= 0; }).map(function (d) { return d[0]; }).join(' ') + (r.paused ? ' · dijeda' : '') + '</div></span>');
it.appendChild(btn(r.paused ? 'Aktifkan' : 'Jeda', function () { items[i].paused = !items[i].paused; LS.set('uv-rem', items); render(); }));
it.appendChild(btn('Hapus', function () { items.splice(i, 1); LS.set('uv-rem', items); render(); }, 'dg')); list.appendChild(it);
});
};
k.appendChild(btn('Tambah pengingat', function () {
if (!t.value.trim() || !sel.length) return toast('Isi judul dan pilih minimal satu hari', 'err');
var items = LS.get('uv-rem', []); items.push({ title: t.value.trim(), time: tm.value || '08:00', days: sel.slice(), paused: false, last: '' }); LS.set('uv-rem', items); t.value = '';
try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
render(); toast('Pengingat ditambahkan', 'ok');
}, 'on', 'bell'));
k.appendChild(list); render(); mount(c, k);
}

var QP_DEF = [
{ name: 'ringkas', text: 'Ringkas teks berikut menjadi poin-poin singkat:\n\n' },
{ name: 'terjemah', text: 'Terjemahkan ke bahasa Indonesia yang natural:\n\n' },
{ name: 'jelaskan', text: 'Jelaskan dengan bahasa sederhana seperti untuk pemula:\n\n' },
{ name: 'perbaiki', text: 'Perbaiki tata bahasa dan ejaan teks berikut tanpa mengubah maknanya:\n\n' },
{ name: 'rencana', text: 'Buat rencana langkah demi langkah untuk:\n\n' },
{ name: 'review', text: 'Tinjau kode berikut: cari bug, risiko, dan saran perbaikan:\n\n' },
];
var allQP = function () { return LS.get('uv-qp', []).concat(QP_DEF); };
function rPrompt(c) {
var k = card('Prompt Cepat', 'Di kolom obrolan ketik "/" lalu pilih prompt. Tambahkan prompt milikmu sendiri di sini.');
var n = mk('input', 'uv2-in'); n.type = 'text'; n.placeholder = 'Nama singkat, contoh: email';
var tx = mk('textarea', 'uv2-in'); tx.rows = 3; tx.placeholder = 'Isi prompt…';
k.appendChild(n); k.appendChild(tx);
var list = mk('div');
var render = function () {
var items = LS.get('uv-qp', []); list.innerHTML = '';
items.forEach(function (p, i) { var it = mk('div', 'uv2-item', '<span><b>/' + esc(p.name) + '</b> ' + esc(p.text.slice(0, 60)) + '</span>'); it.appendChild(btn('Hapus', function () { items.splice(i, 1); LS.set('uv-qp', items); render(); }, 'dg')); list.appendChild(it); });
QP_DEF.forEach(function (p) { list.appendChild(mk('div', 'uv2-item', '<span><b>/' + esc(p.name) + '</b> <span style="opacity:.6">' + esc(p.text.slice(0, 50)) + '</span></span>')); });
};
k.appendChild(btn('Simpan prompt', function () {
var nm = n.value.trim().replace(/\s+/g, '-').toLowerCase(), t = tx.value; if (!nm || !t.trim()) return toast('Isi nama dan prompt', 'err');
var items = LS.get('uv-qp', []); items.unshift({ name: nm, text: t.replace(/\s+$/, '') + '\n\n' }); LS.set('uv-qp', items); n.value = ''; tx.value = ''; render(); toast('Prompt disimpan', 'ok');
}, 'on', 'bolt'));
k.appendChild(list); render(); mount(c, k);
}
var SL = { items: [], idx: 0, box: null, ta: null };
var isChatTa = function (t) { return t && t.tagName === 'TEXTAREA' && /tanyakan/i.test(t.placeholder || ''); };
function slHide() { if (SL.box) SL.box.style.display = 'none'; SL.items = []; }
function slShow(ta) {
if (!SL.box) { SL.box = mk('div', 'uv2-ui'); SL.box.id = 'uv2-slash'; document.body.appendChild(SL.box); }
themeVars(SL.box); SL.ta = ta;
var r = ta.getBoundingClientRect(); SL.box.style.left = r.left + 'px'; SL.box.style.width = r.width + 'px'; SL.box.style.bottom = (window.innerHeight - r.top + 6) + 'px';
SL.box.innerHTML = '';
SL.items.forEach(function (p, i) { var d = mk('div', i === SL.idx ? 'on' : '', '<b>/' + esc(p.name) + '</b><span>' + esc(p.text.replace(/\s+/g, ' ').slice(0, 60)) + '</span>'); d.addEventListener('mousedown', function (e) { e.preventDefault(); slPick(i); }); d.addEventListener('touchstart', function (e) { e.preventDefault(); slPick(i); }, { passive: false }); SL.box.appendChild(d); });
SL.box.style.display = SL.items.length ? 'block' : 'none';
}
function slPick(i) { var p = SL.items[i]; if (!p) return; var ta = SL.ta; slHide(); setVal(ta, p.text); }
document.addEventListener('input', function (e) {
var t = e.target; if (!isChatTa(t)) return; var v = t.value;
if (v.charAt(0) === '/' && v.indexOf('\n') < 0) { var q = norm(v.slice(1)); SL.items = allQP().filter(function (p) { return !q || p.name.indexOf(q) >= 0; }).slice(0, 8); SL.idx = 0; slShow(t); } else slHide();
}, true);
document.addEventListener('keydown', function (e) {
if (!SL.items.length || !isChatTa(e.target)) return;
if (e.key === 'ArrowDown') { SL.idx = (SL.idx + 1) % SL.items.length; slShow(SL.ta); e.preventDefault(); }
else if (e.key === 'ArrowUp') { SL.idx = (SL.idx - 1 + SL.items.length) % SL.items.length; slShow(SL.ta); e.preventDefault(); }
else if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); e.stopImmediatePropagation(); slPick(SL.idx); }
else if (e.key === 'Escape') slHide();
}, true);

var FD = { bar: null, hits: [], i: 0 };
function clearHL() { $$('mark.uv-hl').forEach(function (m) { var p = m.parentNode; if (!p) return; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); }); FD.hits = []; }
function doHL(q) {
clearHL(); q = q.toLowerCase(); if (q.length < 2) return upd();
var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
var p = n.parentElement; if (!p || /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|MARK)$/.test(p.tagName)) return NodeFilter.FILTER_REJECT;
if (p.closest('.uv2-ui,aside,nav,[class*="sidebar" i],#uv2-find')) return NodeFilter.FILTER_REJECT;
return n.nodeValue.toLowerCase().indexOf(q) >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
var nodes = []; while (w.nextNode() && nodes.length < 400) nodes.push(w.currentNode);
nodes.forEach(function (n) {
var txt = n.nodeValue, low = txt.toLowerCase(), pos = 0, frag = document.createDocumentFragment(), i;
while ((i = low.indexOf(q, pos)) >= 0) { if (i > pos) frag.appendChild(document.createTextNode(txt.slice(pos, i))); var m = mk('mark', 'uv-hl'); m.textContent = txt.slice(i, i + q.length); frag.appendChild(m); FD.hits.push(m); pos = i + q.length; }
if (pos < txt.length) frag.appendChild(document.createTextNode(txt.slice(pos))); n.parentNode.replaceChild(frag, n);
});
FD.i = 0; upd(true);
}
function upd(scroll) {
var cnt = $('#uv2-fcount'); if (cnt) cnt.textContent = FD.hits.length ? (FD.i + 1) + '/' + FD.hits.length : '0';
FD.hits.forEach(function (m, i) { m.classList.toggle('cur', i === FD.i); });
if (scroll && FD.hits[FD.i]) FD.hits[FD.i].scrollIntoView({ block: 'center', behavior: 'smooth' });
}
function fStep(d) { if (!FD.hits.length) return; FD.i = (FD.i + d + FD.hits.length) % FD.hits.length; upd(true); }
function toggleFind(force) {
if (!FD.bar) {
FD.bar = mk('div', 'uv2-ui'); FD.bar.id = 'uv2-find';
FD.bar.innerHTML = ic('search', 16) + '<input type="text" placeholder="Cari di obrolan…"><span id="uv2-fcount" style="font-size:12px;min-width:30px;text-align:center">0</span><button type="button" data-a="p" aria-label="Sebelumnya">' + ic('up', 16) + '</button><button type="button" data-a="n" aria-label="Berikutnya">' + ic('down', 16) + '</button><button type="button" data-a="x" aria-label="Tutup">' + ic('x', 16) + '</button>';
document.body.appendChild(FD.bar); var inp = $('input', FD.bar), t;
inp.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { doHL(inp.value); }, 250); });
inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') fStep(e.shiftKey ? -1 : 1); if (e.key === 'Escape') toggleFind(false); });
FD.bar.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; var a = b.getAttribute('data-a'); if (a === 'p') fStep(-1); else if (a === 'n') fStep(1); else toggleFind(false); });
}
var open = force != null ? force : FD.bar.style.display !== 'flex';
themeVars(FD.bar); FD.bar.style.display = open ? 'flex' : 'none';
if (open) { var i2 = $('input', FD.bar); i2.focus(); i2.select(); } else clearHL();
}

var SN = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
async function rStat(c) {
var k = card('Statistik 7 Hari', 'Jumlah obrolan dan berkas per hari (berdasarkan tanggal yang tersimpan) beserta sesi fokus.'); mount(c, k);
k.appendChild(mk('div', 'uv2-m', 'Memuat…'));
var r = await Promise.all([getJSON('/api/wsdata/chats'), getJSON('/api/wsdata/files')]);
var chats = listOf(r[0]), files = listOf(r[1]), days = [];
for (var i = 6; i >= 0; i--) { var d = new Date(); d.setDate(d.getDate() - i); var key = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); days.push({ key: key, n: SN[d.getDay()], c: 0, f: 0, p: PM.done[key] || 0 }); }
var dk = function (dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); };
var dated = 0;
chats.forEach(function (it) { var dt = dateOf(it); if (!dt) return; var x = days.find(function (z) { return z.key === dk(dt); }); if (x) { x.c++; dated++; } });
files.forEach(function (it) { var dt = dateOf(it); if (!dt) return; var x = days.find(function (z) { return z.key === dk(dt); }); if (x) { x.f++; dated++; } });
var mx = Math.max(1, Math.max.apply(null, days.map(function (z) { return Math.max(z.c, z.f, z.p); })));
k.lastChild.remove();
k.appendChild(mk('div', 'uv2-row', '<span class="uv2-btn">Obrolan: ' + chats.length + '</span><span class="uv2-btn">Berkas: ' + files.length + '</span><span class="uv2-btn">Fokus hari ini: ' + (PM.done[today()] || 0) + '</span>'));
var bars = mk('div', 'uv2-bars');
days.forEach(function (z) { var col = mk('div', '', '<div class="uv2-bar2"><i style="height:' + (z.c / mx * 100) + '%;flex:1"></i><i class="b2" style="height:' + (z.f / mx * 100) + '%;flex:1"></i><i style="height:' + (z.p / mx * 100) + '%;flex:1;background:#34d399"></i></div><span>' + z.n + '</span>'); bars.appendChild(col); });
k.appendChild(bars);
k.appendChild(mk('div', 'uv2-m', 'Ungu tua: obrolan · ungu muda: berkas · hijau: sesi fokus' + (dated ? '' : ' · data tanggal belum terbaca dari server, batang masih kosong')));
}

var KEYS = [['Ctrl + K', 'Pencarian global'], ['Ctrl + /', 'Daftar pintasan'], ['Ctrl + Shift + F', 'Cari di obrolan'], ['Ctrl + Shift + N', 'Obrolan baru'], ['Ctrl + Shift + D', 'Ganti tema'], ['Alt + 1…6', 'Obrolan, Koleksi, Pengingat, Studio gambar, Proyek, Lab kode'], ['/ di kolom obrolan', 'Prompt cepat'], ['Esc', 'Tutup panel']];
function rPintas(c) { var k = card('Pintasan Keyboard', 'Berlaku di desktop. Di HP, buka semuanya lewat tombol Pusat alat di sidebar.'); KEYS.forEach(function (x) { k.appendChild(mk('div', 'uv2-kbd', '<kbd>' + esc(x[0]) + '</kbd><span>' + esc(x[1]) + '</span>')); }); mount(c, k); }

var TABS = [['cari', 'Cari', 'search', rCari], ['fokus', 'Fokus', 'timer', rPomo], ['ingat', 'Pengingat', 'bell', rIngat], ['prompt', 'Prompt', 'bolt', rPrompt], ['tampil', 'Tampilan', 'palette', rTampil], ['cadang', 'Cadangan', 'save', rCadang], ['stat', 'Statistik', 'chart', rStat], ['pintas', 'Pintasan', 'kbd', rPintas]];
var CT = { el: null, tab: 'cari' };
function setTab(id) {
CT.tab = id; var tabs = $('.uv2-tabs', CT.el); tabs.innerHTML = '';
TABS.forEach(function (t) { tabs.appendChild(btn(t[1], function () { setTab(t[0]); }, t[0] === id ? 'on' : '', t[2])); });
var body = $('.uv2-body', CT.el); body.innerHTML = ''; TABS.find(function (t) { return t[0] === id; })[3](body);
}
function openCenter(tab) {
if (!CT.el) {
CT.el = mk('div', 'uv2-ui'); CT.el.id = 'uv2-center';
CT.el.innerHTML = '<div class="uv2-head"><span>Pusat alat</span></div><div class="uv2-tabs"></div><div class="uv2-body"></div>';
$('.uv2-head', CT.el).appendChild(btn('Tutup', closeCenter, '', 'x'));
document.body.appendChild(CT.el);
}
themeVars(CT.el); CT.el.style.display = 'flex'; setTab(tab || CT.tab);
}
function closeCenter() { if (CT.el) CT.el.style.display = 'none'; }

var GAL = LS.get('uv-gal', {}), gFilter = 'all';
function gk(card) { var im = $('img', card); return im ? hash(im.getAttribute('src') || '') : ''; }
var gSave = function () { LS.set('uv-gal', GAL); };
function variation(card) {
var cap = $('.uv-cap', card), t = cap ? cap.textContent.replace(/\s+/g, ' ').trim() : '';
var base = (t.split(/\s·\s|\d{1,2} \w{3} \d{4}/)[0] || t).trim();
var mods = ['sudut pandang berbeda', 'palet warna baru', 'suasana senja', 'gaya lebih detail', 'komposisi close-up'];
go('images'); var tries = 0;
var iv = setInterval(function () {
var ta = $$('textarea').find(function (x) { return norm(x.placeholder).indexOf('kota futuristik') >= 0; });
if (ta) { clearInterval(iv); setVal(ta, (base || 'gambar') + ', variasi: ' + mods[Math.floor(Math.random() * mods.length)]); toast('Prompt variasi diisi di Studio gambar', 'ok'); }
else if (++tries > 20) clearInterval(iv);
}, 150);
}
function allTags() { var s = {}; Object.keys(GAL).forEach(function (k) { (GAL[k].t || []).forEach(function (t) { s[t] = 1; }); }); return Object.keys(s); }
function applyGalFilter() {
$$('.uv-kcard').forEach(function (card) {
var g = GAL[gk(card)] || {}, ok = gFilter === 'all' || (gFilter === 'fav' && g.f) || (gFilter.indexOf('tag:') === 0 && (g.t || []).indexOf(gFilter.slice(4)) >= 0);
card.classList.toggle('uv2-hid', !ok);
});
}
function enhanceGallery() {
var cards = $$('.uv-kcard'); if (!cards.length) return;
cards.forEach(function (card) {
var key = gk(card), acts = $('.uv-acts', card); if (!acts || !key) return;
if (!card.dataset.uvG) {
card.dataset.uvG = '1';
var mkb = function (icon, label, fn) { var b = mk('button', 'uv-ibtn uv2-gb', ic(icon, 18)); b.type = 'button'; b.title = label; b.setAttribute('aria-label', label); b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); fn(b); }); return b; };
acts.insertBefore(mkb('tag', 'Tag', function () {
ask('Tag gambar', 'Ketik tag; tag yang sudah ada akan dilepas', allTags(), function (v) {
if (!v) return; v = v.replace(/^#/, '').toLowerCase(); var g = GAL[key] || (GAL[key] = { f: false, t: [] }); var i = g.t.indexOf(v);
if (i >= 0) g.t.splice(i, 1); else g.t.push(v); gSave(); refreshGal();
});
}), acts.firstChild);
acts.insertBefore(mkb('heart', 'Favorit', function () { var g = GAL[key] || (GAL[key] = { f: false, t: [] }); g.f = !g.f; gSave(); refreshGal(); }), acts.firstChild).classList.add('uv2-fav');
acts.insertBefore(mkb('spark', 'Buat variasi', function () { variation(card); }), acts.firstChild);
card.appendChild(mk('div', 'uv2-tags'));
}
var g = GAL[key] || {}, fav = $('.uv2-fav', acts);
if (fav) { fav.classList.toggle('uv2-on', !!g.f); setHTML(fav, ic('heart', 18, !!g.f)); }
var tg = $('.uv2-tags', card); if (tg) setHTML(tg, (g.t || []).map(function (t) { return '<span>#' + esc(t) + '</span>'; }).join(''));
});
var grid = cards[0].parentElement, row = $('.uv2-frow', grid.parentElement);
if (!row) { row = mk('div', 'uv2-frow uv2-ui'); grid.parentElement.insertBefore(row, grid); }
var sig = gFilter + '|' + allTags().join(',') + '|' + Object.keys(GAL).filter(function (k) { return GAL[k].f; }).length;
if (row.dataset.sig !== sig) {
row.dataset.sig = sig; row.innerHTML = '';
var add = function (id, label) { row.appendChild(btn(label, function () { gFilter = id; row.dataset.sig = ''; enhanceGallery(); }, gFilter === id ? 'on' : '')); };
add('all', 'Semua'); add('fav', 'Favorit'); allTags().forEach(function (t) { add('tag:' + t, '#' + t); });
}
applyGalFilter();
}
function refreshGal() { var r = $('.uv2-frow'); if (r) r.dataset.sig = ''; enhanceGallery(); }

var CM = LS.get('uv-chatmeta', {}), cFilter = 'all';
var cSave = function () { LS.set('uv-chatmeta', CM); };
function chatRows() {
var back = $$('button').find(function (b) { return /kembali ke obrolan/.test(norm(b.textContent)); });
if (!back || !back.parentElement) return null;
var host = back.parentElement;
var cand = $$('button,a,[role="button"],li', host).filter(function (r) {
return r !== back && !r.contains(back) && !back.contains(r) && (back.compareDocumentPosition(r) & 4) && norm(r.textContent) &&
!r.closest('.uv2-pin,.uv2-frow,.nav-item,[data-view]') && !r.classList.contains('uv2-btn') && !r.hasAttribute('data-view');
});
var rows = cand.filter(function (r) { return !cand.some(function (o) { return o !== r && o.contains(r); }); });
return { back: back, rows: rows };
}
function enhanceChats() {
var o = chatRows(); if (!o) return;
o.rows.forEach(function (row) {
var key = hash(norm(row.textContent.replace(/📌|#\S+/g, '')).slice(0, 80)); row.dataset.uvKey = key;
if (!row.dataset.uvPin) {
row.dataset.uvPin = '1'; if (getComputedStyle(row).position === 'static') row.style.position = 'relative'; row.style.paddingRight = '58px';
var box = mk('span', 'uv2-pin uv2-ui');
var b1 = mk('button', '', ic('pin', 15)); b1.type = 'button'; b1.title = 'Sematkan';
var b2 = mk('button', '', ic('folder', 15)); b2.type = 'button'; b2.title = 'Folder';
b1.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var m = CM[key] || (CM[key] = {}); m.p = !m.p; cSave(); enhanceChats(); });
b2.addEventListener('click', function (e) {
e.preventDefault(); e.stopPropagation(); var folders = {}; Object.keys(CM).forEach(function (k) { if (CM[k].f) folders[CM[k].f] = 1; });
ask('Pindahkan ke folder', 'Nama folder (kosong = tanpa folder)', Object.keys(folders).concat(['Pekerjaan', 'Belajar', 'Pribadi']).filter(function (v, i, a) { return a.indexOf(v) === i; }), function (v) { var m = CM[key] || (CM[key] = {}); m.f = v || ''; cSave(); enhanceChats(); });
});
box.appendChild(b1); box.appendChild(b2); row.appendChild(box);
}
var m = CM[key] || {}, pb = $('.uv2-pin button', row); if (pb) pb.classList.toggle('on', !!m.p);
var fb = $('.uv2-fb', row); if (m.f) { if (!fb) { fb = mk('span', 'uv2-fb'); row.insertBefore(fb, $('.uv2-pin', row)); } fb.textContent = m.f; } else if (fb) fb.remove();
var show = cFilter === 'all' || (cFilter === 'pin' && m.p) || (cFilter.indexOf('f:') === 0 && m.f === cFilter.slice(2));
row.style.display = show ? '' : 'none';
});
if (o.rows.length) {
var par = o.rows[0].parentElement, same = o.rows.filter(function (x) { return x.parentElement === par; });
var isP = function (r) { return !!(CM[r.dataset.uvKey] || {}).p; };
var want = same.filter(isP).concat(same.filter(function (r) { return !isP(r); }));
if (want.some(function (r, i) { return r !== same[i]; })) { var after = same[same.length - 1].nextSibling; want.forEach(function (r) { par.insertBefore(r, after); }); }
}
var folders = {}; Object.keys(CM).forEach(function (k) { if (CM[k].f) folders[CM[k].f] = 1; });
var row = $('.uv2-frow.uv2-chats'); var sig = cFilter + '|' + Object.keys(folders).join(',') + '|' + (o.rows.length ? 1 : 0);
if (!o.rows.length) { if (row) row.remove(); return; }
if (!row) { row = mk('div', 'uv2-frow uv2-chats uv2-ui'); o.back.parentElement.insertBefore(row, o.back.nextSibling); }
if (row.dataset.sig !== sig) {
row.dataset.sig = sig; row.innerHTML = '';
var add = function (id, label) { var b = btn(label, function () { cFilter = id; enhanceChats(); }, cFilter === id ? 'on' : ''); b.style.padding = '3px 10px'; b.style.fontSize = '11.5px'; row.appendChild(b); };
add('all', 'Semua'); add('pin', 'Disematkan'); Object.keys(folders).forEach(function (f) { add('f:' + f, f); });
}
}

function ensureBtn() {
if ($('[data-uv-center]')) return;
var home = $('[data-uv-home]'), chat = $('.nav-item[data-view="chat"]'), ref = home || chat; if (!ref) return;
var b = mk('button', 'nav-item', '<span class="nav-icon">' + ic('grid', 15) + '</span><span>Pusat alat</span>'); b.type = 'button'; b.setAttribute('data-uv-center', '1');
b.addEventListener('click', function () { openCenter(); });
ref.parentElement.insertBefore(b, home ? home.nextSibling : chat);
}
var fab;
function ensureFab() {
var ta = $$('textarea').find(isChatTa), on = ta && ta.offsetParent !== null;
if (!fab) { fab = mk('button', 'uv2-ui', ic('search', 18)); fab.id = 'uv2-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Cari di obrolan'); fab.addEventListener('click', function () { toggleFind(); }); document.body.appendChild(fab); }
fab.style.display = on ? 'inline-flex' : 'none';
}
var PAGES = { pengingat: [rIngat], fokus: [rPomo], pengaturan: [rTampil, rCadang] };
function scanViews() {
var label = $$('div,span,p,small').find(function (e) { return e.children.length === 0 && norm(e.textContent) === 'umaira workspace' && e.getBoundingClientRect().width > 0; });
if (label) {
var hdr = label.parentElement, view = hdr && hdr.parentElement, h = hdr && hdr.querySelector('h1,h2,h3');
if (view && h) {
var title = norm(h.textContent), fns = PAGES[title], have = $('[data-uv2-page]', view);
if (have && have.getAttribute('data-uv2-page') !== title) have.remove(), have = null;
if (fns && !have) { var w = mk('div'); w.setAttribute('data-uv2-page', title); hdr.insertAdjacentElement('afterend', w); fns.forEach(function (fn) { var s = mk('div'); w.appendChild(s); fn(s); s.firstChild && (s.firstChild.style.margin = '10px 0'); }); }
}
}
var hm = $('#uv-home');
if (hm && hm.style.display !== 'none' && $('[data-go]', hm) && !$('.uv2-stats', hm)) { var host = hm.firstElementChild, s2 = mk('div', 'uv2-stats'); host.appendChild(s2); rStat(s2); var kk = btn('Buka Pusat alat', function () { hm.style.display = 'none'; openCenter(); }, '', 'grid'); host.appendChild(kk); }
}
function scan() {
var f = [ensureBtn, ensureFab, scanViews, enhanceGallery, enhanceChats];
f.forEach(function (fn) { try { fn(); } catch (e) { console.warn('[super]', fn.name, e); } });
}

document.addEventListener('keydown', function (e) {
var ctrl = e.ctrlKey || e.metaKey, k = e.key.toLowerCase();
if (ctrl && !e.shiftKey && k === 'k') { e.preventDefault(); openCenter('cari'); }
else if (ctrl && k === '/') { e.preventDefault(); openCenter('pintas'); }
else if (ctrl && e.shiftKey && k === 'f') { e.preventDefault(); toggleFind(); }
else if (ctrl && e.shiftKey && k === 'n') { e.preventDefault(); var nb = $$('button').find(function (b) { return norm(b.textContent) === 'mulai baru'; }); if (nb) nb.click(); }
else if (ctrl && e.shiftKey && k === 'd') { e.preventDefault(); TH.mode = TH.mode === 'dark' ? 'app' : 'dark'; saveTheme(); toast('Tema: ' + (TH.mode === 'dark' ? 'gelap' : 'bawaan'), 'info'); }
else if (e.altKey && /^[1-6]$/.test(e.key)) { e.preventDefault(); go(['chat', 'library', 'scheduled', 'images', 'projects', 'codex'][Number(e.key) - 1]); }
else if (e.key === 'Escape') { if (CT.el && CT.el.style.display === 'flex') closeCenter(); else if (FD.bar && FD.bar.style.display === 'flex') toggleFind(false); }
});

applyTheme(); pUI(); setInterval(pTick, 500); setInterval(remCheck, 20000);
var raf; new MutationObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); }).observe(document.body, { childList: true, subtree: true });
document.addEventListener('click', function () { setTimeout(scan, 250); }, true);
window.addEventListener('load', scan); scan();
window.UmairaSuper = { open: openCenter, find: toggleFind };
})();
