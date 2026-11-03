/*
 * umaira-fitur.js
 * 1) Logo sidebar: latar putih polos, memakai logo yang sama dengan obrolan bila ditemukan.
 * 2) Perapihan: sembunyikan tombol yang bocor di halaman Pengingat, lebarkan konten,
 *    ubah tombol mikrofon menjadi tombol bulat kecil.
 * 3) Fitur baru per halaman (disimpan di localStorage, tanpa mengubah app.js).
 */
(function () {
  'use strict';
  if (window.__uvFitur) return;
  window.__uvFitur = true;

  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase(); };

  /* ---------- CSS ---------- */
  var css = [
    '.uv-logo-fix{background:#fff!important;background-image:none!important;box-shadow:none!important;border:1px solid rgba(0,0,0,.08)!important;color:#1a1a2e!important}',
    '.uv-logo-fix *{background:transparent!important;color:#1a1a2e!important}',
    '.uv-logo-fix::before,.uv-logo-fix::after{content:none!important;display:none!important;background:none!important}',
    '.uv-logo-fix{filter:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;outline:none!important;-webkit-mask:none!important;mask:none!important}',
    '@media (min-width:768px){.uv-logo-fix,.uv-logo-fix:hover{background:#fff!important;background-image:none!important;box-shadow:none!important}.uv-logo-fix::before,.uv-logo-fix::after{content:none!important;display:none!important}}',
    '.uv-wide>*:not([data-uv-feat]){width:100%!important;max-width:760px!important;box-sizing:border-box}',
    '.uv-wide{display:flex;flex-direction:column;gap:12px}',
    '.uv-mic{display:inline-flex!important;align-items:center;justify-content:center;width:34px!important;height:34px!important;padding:0!important;border-radius:50%!important;margin:6px 0!important}',
    '.uv-hide{display:none!important}',
    '[data-uv-feat]{max-width:760px;width:100%;box-sizing:border-box;border:1px solid rgba(128,128,128,.3);border-radius:14px;padding:14px;background:rgba(255,255,255,.55);color:inherit}',
    '[data-uv-feat] h3{margin:0 0 4px;font-size:15px;font-weight:600}',
    '[data-uv-feat] .uv-d{font-size:12px;opacity:.7;margin:0 0 10px;line-height:1.5}',
    '[data-uv-feat] .uv-row{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}',
    '[data-uv-feat] button,[data-uv-feat] input[type=text],[data-uv-feat] select{font:inherit;font-size:12.5px;padding:6px 12px;border-radius:999px;border:1px solid rgba(128,128,128,.4);background:rgba(255,255,255,.8);color:inherit;cursor:pointer}',
    '[data-uv-feat] input[type=text]{cursor:text;border-radius:10px;width:100%;box-sizing:border-box}',
    '[data-uv-feat] .uv-item{display:flex;align-items:center;gap:8px;font-size:13px;padding:4px 0;border-bottom:1px solid rgba(128,128,128,.15)}',
    '[data-uv-feat] .uv-item span{flex:1;word-break:break-word}',
    '[data-uv-feat] .uv-x{padding:2px 9px!important}',
    '[data-uv-feat] .uv-m{font-size:11.5px;opacity:.6;margin-top:6px}',
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'uv-fitur-style';
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- Util ---------- */
  function setVal(el, v) {
    if (!el) return;
    var proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    var d = Object.getOwnPropertyDescriptor(proto, 'value');
    if (d && d.set) d.set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.focus();
  }
  function byPh(root, sub) {
    return [].slice.call(root.querySelectorAll('textarea,input')).find(function (e) { return norm(e.placeholder).indexOf(sub) >= 0; });
  }
  function toast(msg) {
    var t = document.getElementById('uv-toast2');
    if (!t) {
      t = document.createElement('div');
      t.id = 'uv-toast2';
      t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:90px;z-index:99990;font-size:12px;padding:6px 14px;border-radius:999px;background:rgba(20,20,20,.9);color:#eee;pointer-events:none';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.display = 'block';
    clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = 'none'; }, 1800);
  }
  function card(title, desc) {
    var c = document.createElement('section');
    c.setAttribute('data-uv-feat', title);
    c.innerHTML = '<h3>' + esc(title) + '</h3><p class="uv-d">' + esc(desc) + '</p>';
    return c;
  }
  function chips(items, onPick) {
    var row = document.createElement('div');
    row.className = 'uv-row';
    items.forEach(function (it) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = it.label;
      b.addEventListener('click', function () { onPick(it); });
      row.appendChild(b);
    });
    return row;
  }
  function btn(label, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    b.addEventListener('click', fn);
    return b;
  }

  /* ---------- 1. Logo ---------- */
  function fixLogo() {
    var leaf = [].slice.call(document.querySelectorAll('span,div,strong,b,h1,h2,a')).find(function (e) {
      if (e.children.length || norm(e.textContent) !== 'umaira') return false;
      var r = e.getBoundingClientRect();
      return r.top < 140 && r.left < 220 && r.width > 0;
    });
    if (!leaf) return;
    var icon = leaf.previousElementSibling || (leaf.parentElement && leaf.parentElement.firstElementChild);
    if (!icon || icon === leaf) return;
    if (icon.dataset.uvLogo === '1') return;
    icon.dataset.uvLogo = '1';
    icon.classList.add('uv-logo-fix');
    // Pembungkus kecil (<=64px) yang membawa warna ungu juga ikut dibersihkan.
    var par = icon.parentElement;
    if (par && par !== leaf.parentElement) {
      var pr = par.getBoundingClientRect();
      if (pr.width <= 64 && pr.height <= 64) par.classList.add('uv-logo-fix');
    }
    console.log('[fitur] logo dibersihkan:', icon.className);
    // Salin logo obrolan (gambar/ikon avatar di area pesan) bila ada.
    var src = [].slice.call(document.querySelectorAll('main img, [class*="message"] img, [class*="avatar"] img, img[alt*="umaira" i]'))
      .find(function (im) { return !icon.contains(im) && !im.closest('[class*="sidebar"],aside,nav') && im.naturalWidth > 0 && im.naturalWidth < 600; });
    if (src) {
      icon.innerHTML = '';
      var im = document.createElement('img');
      im.src = src.currentSrc || src.src;
      im.alt = 'Umaira';
      im.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:inherit;background:#fff';
      icon.appendChild(im);
    }
  }

  /* ---------- 2. Perapihan umum ---------- */
  function tidy(view, title) {
    view.classList.add('uv-wide');
    // Tombol Lab kode yang bocor di halaman lain.
    if (title !== 'lab kode') {
      [].slice.call(view.querySelectorAll('button')).forEach(function (b) {
        var t = norm(b.textContent);
        if (['jelaskan kode', 'cari bug', 'buat unit test', 'buat unit', 'salin semua kode', 'unduh semua kode'].indexOf(t) >= 0) {
          (b.parentElement && b.parentElement.children.length > 1 && b.parentElement !== view ? b.parentElement : b).classList.add('uv-hide');
        }
      });
    }
  }
  function tidyMics() {
    [].slice.call(document.querySelectorAll('button')).forEach(function (b) {
      if (b.textContent.trim() === '🎤' && !b.classList.contains('uv-mic')) b.classList.add('uv-mic');
    });
  }

  /* ---------- 3. Fitur per halaman ---------- */
  var FEATURES = {
    'lab kode': function (view) {
      var c = card('Peralatan Lab Kode', 'Templat instruksi cepat dan penyimpan potongan kode. Disimpan di perangkat ini.');
      var ins = function () { return byPh(view, 'instruksi'); };
      var code = function () { return byPh(view, 'tempel kode'); };
      c.appendChild(chips([
        { label: 'Refactor', t: 'Rapikan dan refactor kode ini tanpa mengubah perilakunya, jelaskan perubahannya.' },
        { label: 'Tambah komentar', t: 'Tambahkan komentar yang jelas pada kode ini.' },
        { label: 'Optimalkan', t: 'Optimalkan kinerja kode ini dan jelaskan alasannya.' },
        { label: 'Ke TypeScript', t: 'Ubah kode ini ke TypeScript dengan tipe yang tepat.' },
        { label: 'Buat dokumentasi', t: 'Tulis dokumentasi (README singkat) untuk kode ini.' },
        { label: 'Cek keamanan', t: 'Periksa celah keamanan pada kode ini dan beri perbaikannya.' },
      ], function (it) { setVal(ins(), it.t); }));
      var name = document.createElement('input'); name.type = 'text'; name.placeholder = 'Nama snippet, contoh: validasi email';
      c.appendChild(name);
      var list = document.createElement('div');
      var render = function () {
        var items = LS.get('uv-snip', []);
        list.innerHTML = items.length ? '' : '<div class="uv-m">Belum ada snippet tersimpan.</div>';
        items.forEach(function (s, i) {
          var r = document.createElement('div'); r.className = 'uv-item';
          r.innerHTML = '<span>' + esc(s.name) + '</span>';
          r.appendChild(btn('Muat', function () { setVal(code(), s.code); toast('Snippet dimuat'); }));
          var x = btn('✕', function () { items.splice(i, 1); LS.set('uv-snip', items); render(); }); x.className = 'uv-x'; r.appendChild(x);
          list.appendChild(r);
        });
      };
      var row = document.createElement('div'); row.className = 'uv-row';
      row.appendChild(btn('Simpan kode di kolom sebagai snippet', function () {
        var v = code() && code().value.trim();
        if (!v) return toast('Kolom kode kosong');
        var items = LS.get('uv-snip', []);
        items.unshift({ name: name.value.trim() || 'Snippet ' + (items.length + 1), code: v });
        LS.set('uv-snip', items.slice(0, 30)); name.value = ''; render(); toast('Snippet disimpan');
      }));
      c.appendChild(row); c.appendChild(list); render();
      return c;
    },

    'ruang proyek': function (view) {
      var c = card('Papan Tugas Proyek', 'Daftar centang untuk proyek yang sedang dipilih, plus templat instruksi AI.');
      var ta = function () { return [].slice.call(view.querySelectorAll('textarea')).find(function (t) { return norm(t.placeholder).indexOf('contoh') >= 0; }); };
      c.appendChild(chips([
        { label: 'Asisten coding', t: 'Kamu asisten coding senior. Jawab ringkas, beri contoh kode, dan jelaskan alasannya.' },
        { label: 'Penulis konten', t: 'Kamu penulis konten. Gunakan bahasa Indonesia yang hidup, kalimat pendek, dan ajakan bertindak.' },
        { label: 'Tutor belajar', t: 'Kamu tutor sabar. Jelaskan bertahap dan akhiri dengan satu pertanyaan latihan.' },
      ], function (it) { setVal(ta(), it.t); }));
      var sel = view.querySelector('select');
      var key = function () { return 'uv-todo:' + (sel ? sel.options[sel.selectedIndex] && sel.options[sel.selectedIndex].text : 'umum'); };
      var inp = document.createElement('input'); inp.type = 'text'; inp.placeholder = 'Tugas baru, lalu tekan Enter';
      var list = document.createElement('div');
      var render = function () {
        var items = LS.get(key(), []);
        list.innerHTML = items.length ? '' : '<div class="uv-m">Belum ada tugas untuk proyek ini.</div>';
        items.forEach(function (t, i) {
          var r = document.createElement('label'); r.className = 'uv-item';
          var cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = !!t.done;
          cb.addEventListener('change', function () { items[i].done = cb.checked; LS.set(key(), items); render(); });
          var sp = document.createElement('span'); sp.textContent = t.text; if (t.done) sp.style.textDecoration = 'line-through';
          r.appendChild(cb); r.appendChild(sp);
          var x = btn('✕', function () { items.splice(i, 1); LS.set(key(), items); render(); }); x.className = 'uv-x'; r.appendChild(x);
          list.appendChild(r);
        });
        var d = items.filter(function (t) { return t.done; }).length;
        if (items.length) { var m = document.createElement('div'); m.className = 'uv-m'; m.textContent = d + ' dari ' + items.length + ' selesai'; list.appendChild(m); }
      };
      inp.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter' || !inp.value.trim()) return;
        var items = LS.get(key(), []); items.push({ text: inp.value.trim(), done: false }); LS.set(key(), items); inp.value = ''; render();
      });
      if (sel) sel.addEventListener('change', render);
      c.appendChild(inp); c.appendChild(list); render();
      return c;
    },

    'ekstensi': function (view) {
      var c = card('Paket Ekstensi', 'Aktifkan beberapa ekstensi sekaligus sesuai kebutuhan, atau matikan semuanya.');
      var boxes = function () { return [].slice.call(view.querySelectorAll('input[type=checkbox]')).filter(function (b) { return !b.closest('[data-uv-feat]'); }); };
      var cardOf = function (cb) {
        var p = cb.parentElement;
        for (var i = 0; i < 5 && p && p !== view; i++, p = p.parentElement) if (p.querySelectorAll('input[type=checkbox]').length === 1 && p.textContent.length > 25) return p;
        return cb.parentElement;
      };
      var apply = function (names) {
        var n = 0;
        boxes().forEach(function (cb) {
          var want = names === 'all' ? true : names === 'none' ? false : names.some(function (x) { return norm(cardOf(cb).textContent).indexOf(norm(x)) >= 0; });
          if (cb.checked !== want) { cb.click(); n++; }
        });
        toast(n + ' ekstensi diubah');
      };
      c.appendChild(chips([
        { label: 'Belajar', n: ['Mode Guru', 'Langkah demi Langkah', 'Jujur dan Teliti'] },
        { label: 'Kerja', n: ['Bahasa Formal', 'Jawaban Ringkas', 'Kalkulator', 'Waktu & Tanggal'] },
        { label: 'Santai', n: ['Gaya Santai', 'Mode Kreatif'] },
        { label: 'Developer', n: ['Mode Pengembang', 'Langkah demi Langkah', 'Jawaban Ringkas'] },
        { label: 'Aktifkan semua', n: 'all' },
        { label: 'Nonaktifkan semua', n: 'none' },
      ], function (it) { apply(it.n); }));
      var m = document.createElement('div'); m.className = 'uv-m';
      var upd = function () { var b = boxes(); m.textContent = b.filter(function (x) { return x.checked; }).length + ' dari ' + b.length + ' aktif'; };
      view.addEventListener('change', upd); setTimeout(upd, 100); upd();
      c.appendChild(m);
      return c;
    },

    'studio gambar': function (view) {
      var c = card('Pustaka Gaya & Ide', 'Tambahkan kata kunci gaya ke deskripsi, ambil ide acak, dan buka kembali prompt lama.');
      var pr = function () { return byPh(view, 'kota futuristik'); };
      var add = function (t) { var p = pr(); if (p) setVal(p, (p.value.trim() ? p.value.trim().replace(/[,\s]+$/, '') + ', ' : '') + t); };
      c.appendChild(chips([
        { label: 'Sinematik', t: 'pencahayaan sinematik, detail tinggi' },
        { label: 'Anime', t: 'gaya anime, garis bersih, warna cerah' },
        { label: 'Foto realistis', t: 'foto realistis, lensa 50mm, tajam' },
        { label: 'Cat air', t: 'lukisan cat air lembut' },
        { label: 'Low poly', t: 'gaya low poly 3D, minimalis' },
        { label: '8K', t: 'resolusi sangat tinggi, tekstur halus' },
      ], function (it) { add(it.t); }));
      var ideas = ['kucing astronot di bulan, ilustrasi digital', 'warung kopi di tengah hutan hujan, suasana hangat', 'robot penjual jamu di pasar malam, lampu neon', 'kota terapung di atas awan saat fajar', 'sawah bertingkat di Bali berkabut, pagi hari'];
      var row = document.createElement('div'); row.className = 'uv-row';
      row.appendChild(btn('Ide acak', function () { setVal(pr(), ideas[Math.floor(Math.random() * ideas.length)]); }));
      row.appendChild(btn('Simpan prompt ini', function () {
        var v = pr() && pr().value.trim(); if (!v) return toast('Deskripsi kosong');
        var h = LS.get('uv-prompts', []).filter(function (x) { return x !== v; }); h.unshift(v); LS.set('uv-prompts', h.slice(0, 15)); render(); toast('Prompt disimpan');
      }));
      c.appendChild(row);
      var list = document.createElement('div');
      var render = function () {
        var h = LS.get('uv-prompts', []);
        list.innerHTML = h.length ? '' : '<div class="uv-m">Belum ada prompt tersimpan.</div>';
        h.forEach(function (p, i) {
          var r = document.createElement('div'); r.className = 'uv-item'; r.innerHTML = '<span>' + esc(p) + '</span>';
          r.appendChild(btn('Pakai', function () { setVal(pr(), p); }));
          var x = btn('✕', function () { h.splice(i, 1); LS.set('uv-prompts', h); render(); }); x.className = 'uv-x'; r.appendChild(x);
          list.appendChild(r);
        });
      };
      c.appendChild(list); render();
      return c;
    },

    'pengingat': function (view) {
      var c = card('Templat Pengingat', 'Isi judul dan instruksi otomatis dari templat, lalu atur jam dan tekan Tambah tugas.');
      var T = [
        { label: 'Ringkasan berita', a: 'Ringkasan berita pagi', b: 'Rangkum 5 berita terpenting Indonesia hari ini dalam poin singkat.' },
        { label: 'Tips produktif', a: 'Tips produktif harian', b: 'Beri 3 tips produktif yang bisa langsung dipraktikkan hari ini.' },
        { label: 'Kutipan motivasi', a: 'Motivasi harian', b: 'Tulis satu kutipan motivasi singkat beserta penjelasan satu kalimat.' },
        { label: 'Belajar kata baru', a: 'Kosakata baru', b: 'Ajarkan 5 kosakata bahasa Inggris baru lengkap dengan contoh kalimat.' },
        { label: 'Evaluasi hari', a: 'Refleksi malam', b: 'Ajukan 3 pertanyaan refleksi untuk mengevaluasi hariku.' },
      ];
      c.appendChild(chips(T, function (it) { setVal(byPh(view, 'judul tugas'), it.a); setVal(byPh(view, 'instruksi untuk ai'), it.b); toast('Templat dipakai'); }));
      return c;
    },

    'koleksi': function (view) {
      var c = card('Cari & Atur Koleksi', 'Saring gambar berdasarkan keterangan, dan lihat ringkasan isi koleksimu.');
      var inp = document.createElement('input'); inp.type = 'text'; inp.placeholder = 'Cari gambar, contoh: kelinci';
      var m = document.createElement('div'); m.className = 'uv-m';
      var items = function () {
        var out = [];
        [].slice.call(view.querySelectorAll('img')).forEach(function (im) {
          if (im.closest('[data-uv-feat]')) return;
          var p = im;
          while (p.parentElement && p.parentElement !== view && [].slice.call(p.parentElement.children).filter(function (s) { return s.querySelector('img'); }).length < 2) p = p.parentElement;
          if (out.indexOf(p) < 0) out.push(p);
        });
        return out;
      };
      var run = function () {
        var q = norm(inp.value), all = items(), n = 0;
        all.forEach(function (el) { var ok = !q || norm(el.textContent).indexOf(q) >= 0; el.style.display = ok ? '' : 'none'; if (ok) n++; });
        m.textContent = q ? n + ' dari ' + all.length + ' gambar cocok' : all.length + ' gambar di koleksi';
      };
      inp.addEventListener('input', run);
      c.appendChild(inp); c.appendChild(m); setTimeout(run, 150); run();
      return c;
    },
  };

  /* ---------- Pemindai tampilan ---------- */
  function scan() {
    try { fixLogo(); } catch (e) { console.warn('[fitur] logo', e); }
    try { tidyMics(); } catch (e) {}
    var label = [].slice.call(document.querySelectorAll('div,span,p,small')).find(function (e) {
      return e.children.length === 0 && norm(e.textContent) === 'umaira workspace' && e.getBoundingClientRect().width > 0;
    });
    if (!label) return;
    var hdr = label.parentElement, view = hdr && hdr.parentElement;
    var h = hdr && hdr.querySelector('h1,h2,h3');
    if (!view || !h) return;
    var title = norm(h.textContent);
    tidy(view, title);
    var make = FEATURES[title];
    var have = view.querySelector('[data-uv-feat]');
    if (have && have.getAttribute('data-uv-for') === title) return;
    if (have) have.remove();
    if (!make) return;
    try {
      var el = make(view);
      el.setAttribute('data-uv-for', title);
      hdr.insertAdjacentElement('afterend', el);
    } catch (e) { console.warn('[fitur] ' + title, e); }
  }
  var raf;
  new MutationObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); })
    .observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', function () { setTimeout(scan, 250); }, true);
  window.addEventListener('load', scan);
  scan();
})();
