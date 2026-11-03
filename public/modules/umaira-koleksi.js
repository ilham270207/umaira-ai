(function () {
  'use strict';
  if (window.__uvKoleksi) return;
  window.__uvKoleksi = true;

  var norm = function (s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  var ICON = {
    dl: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M5 21h14"/></svg>',
    del: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>',
    warn: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    ask: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7"/><path d="M12 17h.01"/></svg>',
    ok: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 3 3 5-6"/></svg>',
    err: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16h.01"/></svg>',
    info: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 8h.01"/></svg>',
  };

  var css = [
    '.uv-clear{background:transparent!important;background-image:none!important;border:0!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}',
    '.uv-kgrid{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(150px,1fr))!important;gap:10px!important;align-items:start}',
    '.uv-kgrid>.uv-span{grid-column:1/-1}',
    '.uv-kcard{position:relative!important;padding:0!important;margin:0!important;background:transparent!important;border:0!important;box-shadow:none!important;border-radius:16px!important;overflow:hidden!important;aspect-ratio:1/1;max-width:100%!important;width:100%!important}',
    '.uv-kcard .uv-clear{padding:0!important;margin:0!important;height:100%}',
    '.uv-kcard img{display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;border-radius:16px!important;margin:0!important}',
    '.uv-acts{position:absolute;top:8px;right:8px;display:flex;gap:6px;z-index:3}',
    '.uv-ibtn{display:inline-flex!important;align-items:center;justify-content:center;width:34px!important;height:34px!important;min-width:0!important;padding:0!important;margin:0!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.35)!important;background:rgba(15,15,25,.55)!important;color:#fff!important;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);cursor:pointer;text-decoration:none!important;font-size:0!important;transition:transform .15s,background .15s}',
    '.uv-ibtn:hover,.uv-ibtn:focus-visible{transform:scale(1.1)}',
    '.uv-ibtn.uv-dl:hover{background:rgba(99,102,241,.9)!important}',
    '.uv-ibtn.uv-del:hover{background:rgba(220,38,38,.9)!important}',
    '.uv-cap{position:absolute;left:0;right:0;bottom:0;padding:28px 10px 8px;background:linear-gradient(transparent,rgba(0,0,0,.72));color:#fff!important;font-size:11.5px;line-height:1.4;opacity:0;transition:opacity .2s;pointer-events:none;border-radius:0 0 16px 16px}',
    '.uv-cap *{color:#fff!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;opacity:.95}',
    '.uv-kcard:hover .uv-cap,.uv-kcard.uv-show .uv-cap{opacity:1}',
    '#uv-dlg2{position:fixed;inset:0;z-index:100000;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(10,10,20,.45);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}',
    '#uv-dlg2 .uv-box{width:min(360px,100%);box-sizing:border-box;border-radius:22px;padding:22px 20px 16px;text-align:center;background:var(--uvbg,#fff);color:var(--uvfg,#1a1a2e);border:1px solid rgba(128,128,128,.25);box-shadow:0 24px 60px rgba(0,0,0,.35);animation:uvpop .18s ease-out}',
    '#uv-dlg2 .uv-ic{width:52px;height:52px;margin:0 auto 12px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(99,102,241,.14);color:#6366f1}',
    '#uv-dlg2.uv-danger .uv-ic{background:rgba(220,38,38,.14);color:#dc2626}',
    '#uv-dlg2 h4{margin:0 0 6px;font-size:16px;font-weight:600}',
    '#uv-dlg2 p{margin:0 0 16px;font-size:13px;line-height:1.55;opacity:.75;white-space:pre-wrap;word-break:break-word}',
    '#uv-dlg2 .uv-btns{display:flex;gap:8px}',
    '#uv-dlg2 .uv-btns button{flex:1;font:inherit;font-size:13.5px;padding:10px 12px;border-radius:12px;cursor:pointer;border:1px solid rgba(128,128,128,.35);background:transparent;color:inherit}',
    '#uv-dlg2 .uv-btns .uv-yes{border-color:transparent;background:#6366f1;color:#fff}',
    '#uv-dlg2.uv-danger .uv-btns .uv-yes{background:#dc2626}',
    '@keyframes uvpop{from{transform:scale(.92);opacity:0}to{transform:scale(1);opacity:1}}',
    '#uv-toasts{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:100001;display:flex;flex-direction:column;gap:8px;width:min(380px,calc(100vw - 24px));pointer-events:none}',
    '.uv-t{pointer-events:auto;display:flex;gap:10px;align-items:flex-start;padding:11px 14px;border-radius:16px;font-size:13px;line-height:1.45;background:rgba(24,24,36,.94);color:#f2f2f7;border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 30px rgba(0,0,0,.3);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);animation:uvin .2s ease-out;cursor:pointer;word-break:break-word}',
    '.uv-t svg{flex:none;margin-top:1px}',
    '.uv-t.ok svg{color:#34d399}.uv-t.err svg{color:#f87171}.uv-t.info svg{color:#818cf8}',
    '@keyframes uvin{from{transform:translateY(-10px);opacity:0}to{transform:none;opacity:1}}',
    '#uv-toast,#uv-toast2{border-radius:14px!important;background:rgba(24,24,36,.94)!important;color:#f2f2f7!important;border:1px solid rgba(255,255,255,.12)!important;padding:9px 16px!important;box-shadow:0 10px 30px rgba(0,0,0,.3)!important;font-size:12.5px!important;backdrop-filter:blur(10px)}',
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'uv-koleksi-style';
  st.textContent = css;
  document.head.appendChild(st);

  function toast(msg, type, ms) {
    var box = document.getElementById('uv-toasts');
    if (!box) { box = document.createElement('div'); box.id = 'uv-toasts'; box.setAttribute('role', 'status'); document.body.appendChild(box); }
    var m = String(msg == null ? '' : msg);
    if (!type) type = /gagal|error|salah|tidak (bisa|dapat|valid)|ditolak|kosong/i.test(m) ? 'err' : /berhasil|tersimpan|selesai|disalin|terhapus|dipulihkan/i.test(m) ? 'ok' : 'info';
    var t = document.createElement('div');
    t.className = 'uv-t ' + type;
    t.innerHTML = ICON[type] + '<span>' + esc(m) + '</span>';
    var kill = function () { if (t.parentNode) t.parentNode.removeChild(t); };
    t.addEventListener('click', kill);
    box.appendChild(t);
    setTimeout(kill, ms || (type === 'err' ? 6000 : 3500));
  }

  function themeVars(el) {
    var cs = getComputedStyle(document.body);
    var c = (cs.color.match(/\d+/g) || [0, 0, 0]).map(Number);
    var darkTheme = (0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) > 140;
    el.style.setProperty('--uvbg', darkTheme ? '#1c1c26' : '#ffffff');
    el.style.setProperty('--uvfg', darkTheme ? '#f2f2f7' : '#1a1a2e');
  }
  function showConfirm(msg, onYes) {
    var dlg = document.getElementById('uv-dlg2');
    if (!dlg) {
      dlg = document.createElement('div');
      dlg.id = 'uv-dlg2';
      dlg.setAttribute('role', 'alertdialog');
      dlg.setAttribute('aria-modal', 'true');
      document.body.appendChild(dlg);
    }
    var danger = /hapus|delete|reset|kosongkan|buang|bersihkan|timpa/i.test(msg);
    dlg.className = danger ? 'uv-danger' : '';
    themeVars(dlg);
    dlg.innerHTML =
      '<div class="uv-box"><div class="uv-ic">' + (danger ? ICON.warn : ICON.ask) + '</div>' +
      '<h4>' + (danger ? 'Hapus item ini?' : 'Konfirmasi') + '</h4>' +
      '<p>' + esc(msg || 'Lanjutkan tindakan ini?') + '</p>' +
      '<div class="uv-btns"><button type="button" class="uv-no">Batal</button><button type="button" class="uv-yes">' + (danger ? 'Hapus' : 'Lanjutkan') + '</button></div></div>';
    dlg.style.display = 'flex';
    var close = function () { dlg.style.display = 'none'; dlg.innerHTML = ''; document.removeEventListener('keydown', onKey, true); };
    var onKey = function (e) { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    dlg.onclick = function (e) {
      if (e.target === dlg || e.target.closest('.uv-no')) close();
      else if (e.target.closest('.uv-yes')) { close(); onYes(); }
    };
    var no = dlg.querySelector('.uv-no'); if (no) no.focus();
  }

  var pass = false, lastEl = null, lastT = 0;
  var nativeConfirm = window.confirm.bind(window);
  document.addEventListener('click', function (e) {
    var t = e.target && e.target.closest && e.target.closest('button,a,[role=button],input[type=button],input[type=submit]');
    if (t) { lastEl = t; lastT = Date.now(); }
  }, true);
  window.confirm = function (msg) {
    if (pass) return true;
    if (!lastEl || Date.now() - lastT > 1500 || !document.contains(lastEl)) return nativeConfirm(msg);
    var el = lastEl; lastEl = null;
    showConfirm(String(msg == null ? '' : msg), function () {
      pass = true;
      try { el.click(); } finally { setTimeout(function () { pass = false; }, 120); }
    });
    return false;
  };
  window.alert = function (msg) { toast(msg); };
  window.UmairaNotify = { toast: toast, confirm: showConfirm };

  function iconify(el, kind) {
    var label = kind === 'dl' ? 'Unduh gambar' : 'Hapus gambar';
    el.classList.add('uv-ibtn', kind === 'dl' ? 'uv-dl' : 'uv-del');
    el.removeAttribute('style');
    el.setAttribute('aria-label', label);
    el.title = label;
    el.innerHTML = ICON[kind];
  }

  function processCard(card) {
    if (card.dataset.uvK) return;
    card.dataset.uvK = '1';
    card.classList.add('uv-kcard');
    var img = card.querySelector('img');
    for (var p = img && img.parentElement; p && p !== card; p = p.parentElement) p.classList.add('uv-clear');

    var acts = document.createElement('div'); acts.className = 'uv-acts';
    [].slice.call(card.querySelectorAll('a,button')).forEach(function (e) {
      var t = norm(e.textContent);
      if (t === 'unduh' || t === 'download') { iconify(e, 'dl'); acts.appendChild(e); }
      else if (t === 'hapus' || t === 'delete') { iconify(e, 'del'); acts.appendChild(e); }
    });

    var cap = document.createElement('div'); cap.className = 'uv-cap';
    [].slice.call(card.children).forEach(function (ch) {
      if (ch.contains(img) || ch === acts) return;
      if (norm(ch.textContent)) cap.appendChild(ch); else ch.style.display = 'none';
    });
    card.appendChild(acts);
    card.appendChild(cap);
    card.addEventListener('click', function (e) {
      if (e.target.closest('.uv-acts')) return;
      card.classList.toggle('uv-show');
    });
  }

  function scan() {
    var label = [].slice.call(document.querySelectorAll('div,span,p,small')).find(function (e) {
      return e.children.length === 0 && norm(e.textContent) === 'umaira workspace' && e.getBoundingClientRect().width > 0;
    });
    if (!label) return;
    var hdr = label.parentElement, view = hdr && hdr.parentElement;
    var h = hdr && hdr.querySelector('h1,h2,h3');
    if (!view || !h || norm(h.textContent) !== 'koleksi') return;

    var cards = [];
    [].slice.call(view.querySelectorAll('img')).forEach(function (im) {
      if (im.closest('[data-uv-feat]') || im.closest('.uv-acts')) return;
      var p = im;
      while (p.parentElement && p.parentElement !== view &&
        [].slice.call(p.parentElement.children).filter(function (s) { return s.querySelector('img'); }).length < 2) p = p.parentElement;
      if (p === view || p.parentElement === view) p = im.closest('div,article,li') || im.parentElement;
      if (cards.indexOf(p) < 0) cards.push(p);
    });
    if (!cards.length) return;
    var grid = cards[0].parentElement;
    if (!grid) return;
    grid.classList.add('uv-kgrid', 'uv-clear');
    [].slice.call(grid.children).forEach(function (ch) { if (cards.indexOf(ch) < 0) ch.classList.add('uv-span'); });
    for (var a = grid.parentElement; a && a !== view; a = a.parentElement) a.classList.add('uv-clear');
    cards.forEach(function (c) { if (c.parentElement === grid) processCard(c); });
  }

  var raf;
  new MutationObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); })
    .observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', function () { setTimeout(scan, 250); }, true);
  window.addEventListener('load', scan);
  scan();
})();
