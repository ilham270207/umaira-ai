(function () {
  "use strict";
  var USER = window.__UMAIRA_USER__ || null;
  var CK = "umaira-aurora-color";
  var root = document.documentElement;
  var HEX = /^#[0-9a-f]{6}$/i;
  var DEF = { a: "#8b5cf6", a2: "#4c8dff", c: "#22d3ee" };
  var PRE = [["Ungu biru", "#8b5cf6", "#4c8dff", "#22d3ee"], ["Biru", "#3b82f6", "#22b8ff", "#22d3ee"], ["Cyan", "#06b6d4", "#3b82f6", "#a5f3fc"], ["Indigo", "#6366f1", "#8b5cf6", "#22d3ee"], ["Putih kaca", "#7c8cff", "#c4b5fd", "#ffffff"]];
  var P = {
    ringkas: "M4 7h16M4 12h10M4 17h6",
    rinci: "M4 6h16M4 10h16M4 14h16M4 18h10",
    santai: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM8 14c1 1.5 2.5 2.2 4 2.2s3-.7 4-2.2M9 9.5h.01M15 9.5h.01",
    formal: "M4 8h16v11H4zM9 8V5h6v3M4 13h16",
    contoh: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z",
    langkah: "M5 5h4v4H5zM5 15h4v4H5zM13 7h7M13 17h7",
    inggris: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
    ikuti: "M4 5h8M8 3v2M6 5c0 4 2 7 5 8M10 5c0 3-2 6-6 8M13 20l4-9 4 9M14.5 17h5"
  };
  var CSS = [
    '.uui-card[data-pro="gaya"]{display:none!important}',
    '.au-hint{font-size:12.5px;color:var(--muted);margin:4px 0 8px}',
    '.au-tg{display:grid;grid-template-columns:repeat(auto-fill,minmax(54px,1fr));gap:10px;margin:8px 0}',
    '.au-tb{height:54px;border-radius:17px;display:grid;place-items:center;cursor:pointer;color:var(--muted);background:rgba(127,127,127,.14);border:1px solid var(--border);transition:.18s}',
    '.au-tb[aria-pressed=true]{color:#fff;background:linear-gradient(135deg,var(--au1,#8b5cf6),var(--au2,#4c8dff));border-color:transparent;box-shadow:0 10px 22px -10px var(--au1,#8b5cf6)}',
    '.au-lab{display:block;font-size:12px;margin:10px 0 4px;color:var(--muted)}',
    '.au-in,.au-ta{width:100%;box-sizing:border-box;padding:9px 12px;border-radius:12px;border:1px solid var(--border);background:rgba(127,127,127,.1);color:inherit;font:inherit;font-size:13px}',
    '.au-ta{min-height:84px;resize:vertical}',
    '.au-st{font-size:12.5px;margin:8px 0 0;color:var(--muted)}',
    '.au-cur{height:10px;border-radius:99px;margin:6px 0 12px;background:linear-gradient(90deg,var(--au1,#8b5cf6),var(--au2,#4c8dff),var(--au3,#22d3ee))}',
    '.au-sw{display:flex;gap:12px;flex-wrap:wrap;margin:8px 0 14px}',
    '.au-sw button{width:34px;height:34px;border-radius:50%;border:0;cursor:pointer;background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 0 0 2px rgba(255,255,255,.5)}',
    '.au-sw .cu{border:2px dashed rgba(255,255,255,.7)}',
    '.au-sl{display:grid;gap:6px;font-size:12px;color:var(--muted);margin:8px 0}',
    '.au-sl input{-webkit-appearance:none;appearance:none;width:100%;height:10px;border-radius:99px;border:0}',
    '.au-sl input::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--au1,#8b5cf6);box-shadow:0 2px 8px rgba(0,0,0,.3)}',
    '.au-sl input::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#fff;border:3px solid var(--au1,#8b5cf6)}',
    '.au-h{background:linear-gradient(90deg,hsl(0 90% 60%),hsl(60 90% 60%),hsl(120 90% 60%),hsl(180 90% 60%),hsl(240 90% 60%),hsl(300 90% 60%),hsl(360 90% 60%))!important}',
    '.au-s{background:linear-gradient(90deg,hsl(var(--sh,258) 30% 60%),hsl(var(--sh,258) 100% 60%))!important}',
    '.au-l{background:linear-gradient(90deg,hsl(var(--sh,258) 80% 35%),hsl(var(--sh,258) 80% 75%))!important}',
    '.au-btn{padding:9px 14px;border-radius:12px;border:1px solid var(--border);background:rgba(127,127,127,.12);color:inherit;font:inherit;font-size:13px;cursor:pointer;margin:6px 8px 0 0}',
    '.au-pick{display:grid;gap:12px;padding-top:10px}.au-pick[hidden]{display:none}',
    '.au-seg{display:flex;gap:6px}.au-seg button{flex:1;padding:9px;border-radius:12px;border:1px solid var(--border);background:rgba(127,127,127,.12);color:inherit;font:inherit;font-size:13px;cursor:pointer}',
    '.au-seg button[aria-pressed=true]{background:var(--au1,#8b5cf6);border-color:transparent;color:#fff}',
    '.au-sv{--ph:258;position:relative;height:150px;border-radius:16px;touch-action:none;cursor:crosshair;background:linear-gradient(to top,#000,transparent),linear-gradient(to right,#fff,hsl(var(--ph) 100% 50%))}',
    '.au-sv i{position:absolute;width:20px;height:20px;margin:-10px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.4),0 2px 8px rgba(0,0,0,.4);pointer-events:none}',
    '.au-hx{display:flex;gap:8px;align-items:center}.au-hx .au-in{flex:1;min-width:0}'
  ].join("");

  function $(s, r) { return (r || document).querySelector(s); }
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ic(n) { return '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + P[n] + '"/></svg>'; }

  /* ---------- matematika warna ---------- */
  function hx2(a) { return "#" + a.map(function (x) { return Math.round(x * 255).toString(16).padStart(2, "0"); }).join(""); }
  function h2x(h, s, l) { s /= 100; l /= 100; var k = function (n) { return (n + h / 30) % 12; }; var f = function (n) { return l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)); }; return hx2([f(0), f(8), f(4)]); }
  function v2x(h, s, v) { var f = function (n) { var k = (n + h / 60) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return hx2([f(5), f(3), f(1)]); }
  function x2v(x) { var r = parseInt(x.slice(1, 3), 16) / 255, g = parseInt(x.slice(3, 5), 16) / 255, b = parseInt(x.slice(5, 7), 16) / 255, m = Math.max(r, g, b), d = m - Math.min(r, g, b), h = 0; if (d) { h = m === r ? ((g - b) / d) % 6 : m === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; } return [h, m ? d / m : 0, m]; }
  function x2hsl(x) { var v = x2v(x), l = v[2] * (1 - v[1] / 2), s = (l === 0 || l === 1) ? 0 : (v[2] - l) / Math.min(l, 1 - l); return [v[0], s * 100, l * 100]; }

  /* ---------- penyimpanan warna (di perangkat) ---------- */
  var S = load();
  function load() {
    var s = { a: DEF.a, a2: DEF.a2, c: DEF.c, cus: [] };
    try {
      var v = JSON.parse(localStorage.getItem(CK) || "null");
      if (v) {
        ["a", "a2", "c"].forEach(function (k) { if (HEX.test(v[k])) s[k] = v[k]; });
        if (Array.isArray(v.cus)) s.cus = v.cus.filter(function (c) { return c && HEX.test(c.a) && HEX.test(c.a2) && HEX.test(c.c); }).slice(0, 12);
      }
    } catch (e) {}
    return s;
  }
  function persist() { try { localStorage.setItem(CK, JSON.stringify(S)); } catch (e) {} }
  function apply() { root.style.setProperty("--au1", S.a); root.style.setProperty("--au2", S.a2); root.style.setProperty("--au3", S.c); }
  function paint(o) { ["a", "a2", "c"].forEach(function (k) { if (o[k] && HEX.test(o[k])) S[k] = o[k]; }); apply(); persist(); }

  /* ---------- kartu Warna Umaira ---------- */
  function colorCard() {
    var H = 258, SA = 90, LI = 66, tgt = "a", pv = [258, 0.65, 0.97];
    var card = el("div", "uui-card");
    card.setAttribute("data-pro", "au-warna"); card.setAttribute("data-au", "warna");
    card.appendChild(el("h3", null, "Warna Umaira"));
    card.appendChild(el("p", "au-hint", "Geser untuk menyesuaikan warna, atau buka Warna lain untuk mengatur gradasi sendiri. Tersimpan di perangkat ini."));
    card.appendChild(el("div", "au-cur"));
    var sw = el("div", "au-sw"); card.appendChild(sw);

    function swatch(c1, c2, title, fn, cls) {
      var b = el("button", cls || ""); b.type = "button"; b.title = title; b.setAttribute("aria-label", title);
      b.style.cssText = "--c1:" + c1 + ";--c2:" + c2; b.addEventListener("click", fn); sw.appendChild(b);
    }
    function slider(label, cls, min, max, onv) {
      var l = el("label", "au-sl", label), i = el("input", cls);
      i.type = "range"; i.min = min; i.max = max; i.addEventListener("input", function () { onv(+i.value); });
      l.appendChild(i); card.appendChild(l); return i;
    }
    function fromHSL() {
      card.style.setProperty("--sh", H);
      paint({ a: h2x(H, SA, LI), a2: h2x((H + 324) % 360, SA, LI), c: h2x((H + 289) % 360, SA, Math.min(LI + 4, 80)) });
    }
    var sH = slider("Rona", "au-h", 0, 360, function (v) { H = v; fromHSL(); });
    var sS = slider("Kejenuhan", "au-s", 30, 100, function (v) { SA = v; fromHSL(); });
    var sL = slider("Kecerahan", "au-l", 35, 80, function (v) { LI = v; fromHSL(); });
    function syncSliders() {
      var h = x2hsl(S.a); H = Math.round(h[0]); SA = clamp(Math.round(h[1]), 30, 100); LI = clamp(Math.round(h[2]), 35, 80);
      sH.value = H; sS.value = SA; sL.value = LI; card.style.setProperty("--sh", H);
    }
    function drawSw() {
      sw.textContent = "";
      PRE.forEach(function (p) { swatch(p[1], p[2], p[0], function () { paint({ a: p[1], a2: p[2], c: p[3] }); syncSliders(); }); });
      S.cus.forEach(function (c, i) { swatch(c.a, c.a2, "Warna saya " + (i + 1), function () { paint(c); syncSliders(); }, "cu"); });
    }

    /* kotak gradasi */
    var more = el("button", "au-btn", "Warna lain"); more.type = "button"; card.appendChild(more);
    var reset = el("button", "au-btn", "Kembalikan bawaan"); reset.type = "button"; card.appendChild(reset);
    var pick = el("div", "au-pick"); pick.hidden = true; card.appendChild(pick);
    var seg = el("div", "au-seg"); pick.appendChild(seg);
    var sv = el("div", "au-sv"), knob = el("i"); sv.appendChild(knob); pick.appendChild(sv);
    var ph = el("input", "au-h"); ph.type = "range"; ph.min = 0; ph.max = 360; ph.setAttribute("aria-label", "Rona");
    var phw = el("div", "au-sl"); phw.appendChild(ph); pick.appendChild(phw);
    var hxRow = el("div", "au-hx"), hex = el("input", "au-in"), save = el("button", "au-btn", "Simpan warna");
    hex.maxLength = 7; hex.setAttribute("aria-label", "Kode warna"); save.type = "button"; save.style.margin = "0";
    hxRow.appendChild(hex); hxRow.appendChild(save); pick.appendChild(hxRow);

    function sync() {
      var x = v2x(pv[0], pv[1], pv[2]), o = {}; o[tgt] = x;
      sv.style.setProperty("--ph", pv[0]); knob.style.left = pv[1] * 100 + "%"; knob.style.top = (1 - pv[2]) * 100 + "%";
      hex.value = x; paint(o);
    }
    function showPick() { pv = x2v(S[tgt]); ph.value = pv[0]; sync(); }
    [["a", "Warna 1"], ["a2", "Warna 2"], ["c", "Kilau"]].forEach(function (t) {
      var b = el("button", null, t[1]); b.type = "button"; b.setAttribute("aria-pressed", String(t[0] === tgt));
      b.addEventListener("click", function () { tgt = t[0]; Array.prototype.forEach.call(seg.children, function (x) { x.setAttribute("aria-pressed", String(x === b)); }); showPick(); });
      seg.appendChild(b);
    });
    function mv(e) { var r = sv.getBoundingClientRect(); pv[1] = clamp((e.clientX - r.left) / r.width, 0, 1); pv[2] = 1 - clamp((e.clientY - r.top) / r.height, 0, 1); sync(); }
    sv.addEventListener("pointerdown", function (e) { sv.setPointerCapture(e.pointerId); mv(e); sv.onpointermove = mv; });
    sv.addEventListener("pointerup", function () { sv.onpointermove = null; });
    ph.addEventListener("input", function () { pv[0] = +ph.value; sync(); });
    hex.addEventListener("change", function () { var v = hex.value.trim(); if (HEX.test(v)) { pv = x2v(v); ph.value = pv[0]; sync(); } else { hex.value = S[tgt]; } });
    more.addEventListener("click", function () { pick.hidden = !pick.hidden; if (!pick.hidden) showPick(); });
    save.addEventListener("click", function () { S.cus.push({ a: S.a, a2: S.a2, c: S.c }); S.cus = S.cus.slice(-12); persist(); drawSw(); });
    reset.addEventListener("click", function () { paint(DEF); syncSliders(); if (!pick.hidden) showPick(); });
    syncSliders(); drawSw();
    return card;
  }

  /* ---------- kartu Gaya Umaira (ikon on/off, tersimpan di akun) ---------- */
  function gayaCard() {
    var st = { nama: "", gaya: "seimbang", nada: "netral", bahasa: "id", instruksi: "", contoh: false, langkah: false };
    var T = [
      ["ringkas", "Ringkas", function () { return st.gaya === "ringkas"; }, function (o) { st.gaya = o ? "ringkas" : "seimbang"; }],
      ["rinci", "Rinci", function () { return st.gaya === "rinci"; }, function (o) { st.gaya = o ? "rinci" : "seimbang"; }],
      ["santai", "Santai", function () { return st.nada === "santai"; }, function (o) { st.nada = o ? "santai" : "netral"; }],
      ["formal", "Formal", function () { return st.nada === "formal"; }, function (o) { st.nada = o ? "formal" : "netral"; }],
      ["contoh", "Sertakan contoh", function () { return st.contoh; }, function (o) { st.contoh = o; }],
      ["langkah", "Jawab per langkah", function () { return st.langkah; }, function (o) { st.langkah = o; }],
      ["inggris", "Jawab dalam Inggris", function () { return st.bahasa === "en"; }, function (o) { st.bahasa = o ? "en" : "id"; }],
      ["ikuti", "Ikuti bahasaku", function () { return st.bahasa === "auto"; }, function (o) { st.bahasa = o ? "auto" : "id"; }]
    ];
    var card = el("div", "uui-card");
    card.setAttribute("data-pro", "au-gaya"); card.setAttribute("data-au", "gaya");
    card.appendChild(el("h3", null, "Gaya Umaira"));
    card.appendChild(el("p", "au-hint", "Ketuk ikon untuk menyalakan atau mematikan. Tersimpan di akunmu dan berlaku di semua obrolan."));
    card.appendChild(el("span", "au-lab", "Nama panggilan"));
    var nama = el("input", "au-in"); nama.type = "text"; nama.maxLength = 40; nama.placeholder = "Contoh: Ilham";
    nama.addEventListener("input", function () { st.nama = nama.value; queue(); });
    card.appendChild(nama);
    var tg = el("div", "au-tg"); card.appendChild(tg);
    var info = el("p", "au-st"); info.setAttribute("role", "status"); card.appendChild(info);
    card.appendChild(el("span", "au-lab", "Instruksi khusus (opsional)"));
    var ta = el("textarea", "au-ta"); ta.maxLength = 1500; ta.placeholder = "Contoh: Saya mahasiswa, jelaskan dengan contoh sederhana.";
    var cnt = el("p", "au-st", "0/1500");
    ta.addEventListener("input", function () { st.instruksi = ta.value; cnt.textContent = ta.value.length + "/1500"; queue(); });
    card.appendChild(ta); card.appendChild(cnt);
    var status = el("p", "au-st"); status.setAttribute("role", "status"); card.appendChild(status);

    var timer = null;
    function queue() { status.textContent = "Menyimpan..."; clearTimeout(timer); timer = setTimeout(send, 700); }
    function send() {
      fetch("/api/gaya", { method: "PUT", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ value: st }) })
        .then(function (r) { status.textContent = r.ok ? "Tersimpan." : "Gagal menyimpan."; })
        .catch(function () { status.textContent = "Gagal menyimpan."; });
    }
    function draw() {
      tg.textContent = "";
      var aktif = [];
      T.forEach(function (t) {
        var on = t[2](), b = el("button", "au-tb"); b.type = "button"; b.title = t[1]; b.setAttribute("aria-label", t[1]); b.setAttribute("aria-pressed", String(on));
        b.innerHTML = ic(t[0]);
        b.addEventListener("click", function () { t[3](!t[2]()); draw(); queue(); });
        tg.appendChild(b); if (on) aktif.push(t[1]);
      });
      info.textContent = aktif.length ? "Aktif: " + aktif.join(", ") : "Belum ada gaya aktif. Umaira memakai gaya bawaan.";
    }
    draw();
    fetch("/api/gaya", { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (!d || !d.value || typeof d.value !== "object") return;
        ["nama", "gaya", "nada", "bahasa", "instruksi"].forEach(function (k) { if (typeof d.value[k] === "string") st[k] = d.value[k]; });
        ["contoh", "langkah"].forEach(function (k) { if (typeof d.value[k] === "boolean") st[k] = d.value[k]; });
        nama.value = st.nama; ta.value = st.instruksi; cnt.textContent = st.instruksi.length + "/1500"; draw();
      }).catch(function () {});
    return card;
  }

  /* ---------- pasang ke panel Pengaturan ---------- */
  function trimOld() {
    var labs = document.querySelectorAll('[data-pro="look"] .pro-lab');
    for (var i = 0; i < labs.length; i++) {
      if (labs[i].textContent.trim() === "Warna aksen") { var n = labs[i].nextElementSibling; if (n) n.remove(); labs[i].remove(); }
    }
  }
  function inject() {
    var heads = document.querySelectorAll(".uui-card > h3");
    for (var i = 0; i < heads.length; i++) {
      if (heads[i].textContent.trim() !== "Tampilan") continue;
      var card = heads[i].parentNode;
      if (card.parentNode && card.parentNode.querySelector("[data-au]")) continue;
      var ref = card;
      if (USER) { var g = gayaCard(); ref.after(g); ref = g; }
      ref.after(colorCard());
    }
  }
  function init() {
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    apply();
    var timer = null;
    new MutationObserver(function () {
      if (timer) return;
      timer = setTimeout(function () { timer = null; trimOld(); inject(); }, 200);
    }).observe(document.body, { childList: true, subtree: true });
    trimOld(); inject();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
