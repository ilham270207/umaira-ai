(function () {
  var form = document.getElementById("authForm"), btn = document.getElementById("submitBtn");
  if (!form || !btn) return;
  var st = { mode: "", id: "", widget: null, on: false };
  var box = document.createElement("div");
  box.className = "um-cap"; box.hidden = true;
  btn.parentNode.insertBefore(box, btn);
  var of = window.fetch, img = null, inp = null;

  function setupImage(j) {
    if (st.mode !== "image") {
      st.mode = "image";
      box.innerHTML = '<label for="umCapIn">Verifikasi: ketik huruf pada gambar</label>' +
        '<div class="um-cap-row"><img id="umCapImg" alt="Gambar captcha" width="220" height="70">' +
        '<button type="button" id="umCapNew" aria-label="Ganti gambar captcha">Ganti</button></div>' +
        '<input id="umCapIn" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="5" placeholder="Ketik 5 karakter">';
      img = box.querySelector("#umCapImg"); inp = box.querySelector("#umCapIn");
      box.querySelector("#umCapNew").onclick = function () { load(); inp.focus(); };
    }
    st.id = j.id; inp.value = "";
    img.src = "data:image/svg+xml;utf8," + encodeURIComponent(j.svg);
    box.hidden = false;
  }

  function withGoogle(cb) {
    if (window.grecaptcha && typeof window.grecaptcha.render === "function") return cb();
    window.__umCapReady = cb;
    var s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?onload=__umCapReady&render=explicit&hl=id";
    s.async = true; s.defer = true;
    s.onerror = function () {
      box.innerHTML = '<p style="font-size:13px;margin:8px 0;opacity:.8">Verifikasi Google tidak bisa dimuat. Periksa koneksi lalu muat ulang halaman.</p>';
      box.hidden = false;
    };
    document.head.appendChild(s);
  }

  function setupGoogle(siteKey) {
    if (st.mode === "google") { if (st.widget !== null && window.grecaptcha) window.grecaptcha.reset(st.widget); return; }
    st.mode = "google";
    box.innerHTML = '<div id="umCapG" style="display:flex;justify-content:center;min-height:78px;margin:6px 0"></div>';
    box.hidden = false;
    withGoogle(function () {
      var holder = box.querySelector("#umCapG");
      if (!holder || st.widget !== null) return;
      var compact = box.clientWidth > 0 && box.clientWidth < 320;
      var dark = document.documentElement.getAttribute("data-uui") === "dark";
      st.widget = window.grecaptcha.render(holder, { sitekey: siteKey, size: compact ? "compact" : "normal", theme: dark ? "dark" : "light" });
    });
  }

  function load() {
    return of.call(window, "/api/auth/captcha", { credentials: "same-origin", cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j.enabled) { st.on = false; box.hidden = true; return; }
        st.on = true;
        if (j.provider === "recaptcha" && j.siteKey) setupGoogle(j.siteKey); else setupImage(j);
      }).catch(function () {});
  }

  window.fetch = function (u, o) {
    try {
      var url = typeof u === "string" ? u : (u && u.url) || "";
      if (st.on && o && /^POST$/i.test(o.method || "") && /\/api\/auth\/(login|register)(\?|$)/.test(url) && typeof o.body === "string") {
        var b = JSON.parse(o.body);
        if (st.mode === "google") b.recaptchaToken = (window.grecaptcha && st.widget !== null) ? window.grecaptcha.getResponse(st.widget) : "";
        else { b.captchaId = st.id; b.captchaAnswer = inp ? inp.value : ""; }
        var p = of.call(this, u, Object.assign({}, o, { body: JSON.stringify(b) }));
        p.then(function (r) {
          if (r.ok) return;
          if (st.mode === "google") { if (window.grecaptcha && st.widget !== null) window.grecaptcha.reset(st.widget); }
          else load();
        }, function () { if (st.mode === "image") load(); });
        return p;
      }
    } catch (e) {}
    return of.apply(this, arguments);
  };
  load();
})();
