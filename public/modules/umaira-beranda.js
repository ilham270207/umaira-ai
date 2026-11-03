/*
 * umaira-beranda.js
 * Beranda ringkas: tombol "Beranda" di sidebar membuka panel berisi sapaan,
 * statistik, tugas terjadwal, dan proyek. Navigasi memakai tombol sidebar yang sudah ada
 * (data-view), jadi tidak bergantung pada kode app.js.
 */
(function () {
  'use strict';
  if (window.__uvHome) return;
  window.__uvHome = true;

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var get = async function (p) {
    try { var r = await fetch(p); if (!r.ok) return null; return await r.json(); } catch (e) { return null; }
  };

  // Ambil daftar dari berbagai bentuk respons API.
  function listOf(d) {
    if (Array.isArray(d)) return d;
    if (d && typeof d === 'object') {
      var keys = ['items', 'tasks', 'files', 'chats', 'workspaces', 'projects', 'value', 'data'];
      for (var i = 0; i < keys.length; i++) {
        var v = d[keys[i]];
        if (Array.isArray(v)) return v;
        if (v && typeof v === 'object') { var inner = listOf(v); if (inner.length) return inner; }
      }
      var vals = Object.keys(d).map(function (k) { return d[k]; });
      for (var j = 0; j < vals.length; j++) if (Array.isArray(vals[j])) return vals[j];
    }
    return [];
  }

  function greeting() {
    var h = Number(new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jakarta' }).format(new Date()));
    if (h < 4) return 'Selamat malam';
    if (h < 11) return 'Selamat pagi';
    if (h < 15) return 'Selamat siang';
    if (h < 19) return 'Selamat sore';
    return 'Selamat malam';
  }

  function go(view) {
    var b = document.querySelector('.nav-item[data-view="' + view + '"]') || document.querySelector('[data-view="' + view + '"]');
    close();
    if (b) b.click();
  }

  function close() {
    var ov = document.getElementById('uv-home');
    if (ov) ov.style.display = 'none';
  }

  function palette() {
    var cs = getComputedStyle(document.body);
    var m = (cs.color.match(/\d+/g) || [0, 0, 0]).map(Number);
    var light = (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) > 140;
    return { bg: light ? '#0b0b10' : '#fbfbfd', fg: cs.color };
  }

  var BORDER = '1px solid rgba(128,128,128,.3)';
  var CARD = 'border:' + BORDER + ';border-radius:12px;padding:12px;';

  function shell() {
    var ov = document.getElementById('uv-home');
    var p = palette();
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'uv-home';
      ov.addEventListener('click', function (e) {
        var t = e.target.closest('[data-go],[data-close]');
        if (!t) return;
        if (t.hasAttribute('data-close')) close(); else go(t.getAttribute('data-go'));
      });
      document.body.appendChild(ov);
    }
    ov.style.cssText = 'position:fixed;inset:0;z-index:99998;overflow:auto;padding:16px;display:block;background:' + p.bg + ';color:' + p.fg;
    return ov;
  }

  async function open() {
    var ov = shell();
    ov.innerHTML = '<div style="max-width:640px;margin:0 auto"><p>Memuat…</p></div>';
    var r = await Promise.all([
      get('/api/wsdata/scheduled'), get('/api/workspaces'), get('/api/wsdata/files'), get('/api/wsdata/chats'), get('/api/auth/me'),
    ]);
    var tasks = listOf(r[0]), projects = listOf(r[1]), files = listOf(r[2]), chats = listOf(r[3]);
    var me = r[4] || {};
    var name = me.name || me.username || (me.user && (me.user.name || me.user.username)) || '';

    var stat = function (n, label, view) {
      return '<button type="button" data-go="' + view + '" style="' + CARD + 'text-align:left;background:transparent;color:inherit;cursor:pointer">' +
        '<div style="font-size:22px;font-weight:500">' + n + '</div><div style="font-size:12px;opacity:.65">' + label + '</div></button>';
    };
    var pill = function (label, view) {
      return '<button type="button" data-go="' + view + '" style="border:' + BORDER + ';border-radius:999px;padding:8px 14px;font-size:13px;background:transparent;color:inherit;cursor:pointer">' + label + '</button>';
    };

    ov.innerHTML =
      '<div style="max-width:640px;margin:0 auto;display:flex;flex-direction:column;gap:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">' +
      '<div><div style="font-size:22px;font-weight:500">' + greeting() + (name ? ', ' + esc(name) : '') + '</div>' +
      '<div style="font-size:13px;opacity:.65">Ringkasan ruang kerjamu.</div></div>' +
      '<button type="button" data-close style="border:' + BORDER + ';border-radius:8px;padding:6px 12px;background:transparent;color:inherit;cursor:pointer">Tutup</button></div>' +

      '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">' +
      stat(chats.length, 'Obrolan', 'chat') + stat(files.length, 'Berkas', 'library') +
      stat(tasks.length, 'Tugas terjadwal', 'scheduled') + stat(projects.length, 'Proyek', 'projects') + '</div>' +

      '<div style="' + CARD + '"><div style="font-size:14px;font-weight:500;margin-bottom:6px">Tugas terjadwal</div>' +
      (tasks.length
        ? tasks.slice(0, 5).map(function (t) {
          return '<div style="display:flex;gap:8px;font-size:13px;padding:3px 0"><span style="opacity:.65;min-width:44px">' + esc(t.time || t.at || '') + '</span><span>' + esc(t.title || t.name || 'Tugas') + '</span></div>';
        }).join('')
        : '<div style="font-size:13px;opacity:.65">Belum ada tugas terjadwal.</div>') + '</div>' +

      '<div><div style="font-size:14px;font-weight:500;margin-bottom:6px">Proyek</div>' +
      (projects.length
        ? projects.slice(0, 3).map(function (p) {
          return '<button type="button" data-go="projects" style="' + CARD + 'display:block;width:100%;text-align:left;background:transparent;color:inherit;cursor:pointer;margin-bottom:6px">' +
            '<div style="font-size:14px">' + esc(p.name || p.title || 'Proyek') + '</div>' +
            '<div style="font-size:12px;opacity:.65">' + esc(p.description || p.desc || '') + '</div></button>';
        }).join('')
        : '<div style="font-size:13px;opacity:.65">Belum ada proyek.</div>') + '</div>' +

      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      pill('Obrolan baru', 'chat') + pill('Studio gambar', 'images') + pill('Lab kode', 'codex') + pill('Pengingat', 'scheduled') + '</div></div>';
  }

  function ensureButton() {
    if (document.querySelector('[data-uv-home]')) return;
    var chat = document.querySelector('.nav-item[data-view="chat"]');
    if (!chat) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'nav-item';
    b.setAttribute('data-uv-home', '1');
    b.innerHTML = '<span class="nav-icon">⌂</span><span>Beranda</span>';
    b.addEventListener('click', open);
    chat.parentElement.insertBefore(b, chat);
  }

  var raf;
  new MutationObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(ensureButton); })
    .observe(document.body, { childList: true, subtree: true });
  ensureButton();
  window.UmairaBeranda = { open: open, close: close, _listOf: listOf };
})();
