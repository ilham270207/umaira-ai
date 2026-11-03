(function () {
  'use strict';
  if (window.__uvMic) return;
  window.__uvMic = true;

  var MIC_RE = /\uD83C\uDFA4\uFE0F?/g;
  var PATH = '<rect x="9" y="2" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v4"/><path d="M8 22h8"/>';
  var svg = function (n) { return '<svg viewBox="0 0 24 24" width="' + n + '" height="' + n + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + PATH + '</svg>'; };
  var BIG = svg(18), SMALL = svg(16);

  var css = [
    '.uv-micsvg{display:inline-flex;align-items:center;justify-content:center;vertical-align:-0.2em;line-height:1}',
    '.uv-micsvg svg{width:1.15em;height:1.15em}',
    '.uv-micwrap{position:relative;display:block;width:100%}',
    '.uv-micwrap>textarea{width:100%!important;box-sizing:border-box!important;padding-bottom:44px!important}',
    '.uv-micwrap>input{width:100%!important;box-sizing:border-box!important;padding-right:46px!important}',
    '.uv-micwrap>.uv-micin{position:absolute!important;right:28px!important;bottom:8px!important;left:auto!important;top:auto!important;width:32px!important;height:32px!important;min-width:0!important;margin:0!important;padding:0!important;display:inline-flex!important;align-items:center;justify-content:center;border-radius:50%!important;border:1px solid rgba(128,128,128,.35)!important;background:rgba(255,255,255,.92)!important;color:#6366f1!important;cursor:pointer;font-size:0!important;box-shadow:0 1px 4px rgba(0,0,0,.12);transition:background .15s,color .15s}',
    '.uv-micwrap>.uv-micin.uv-micinp{right:7px!important;bottom:auto!important;top:50%!important;margin-top:-16px!important}',
    '.uv-micwrap>.uv-micin:hover{background:#eef0ff!important}',
    '.uv-micwrap>.uv-micin[aria-pressed="true"]{background:#ef4444!important;color:#fff!important;border-color:#ef4444!important;animation:uvpulse 1.2s infinite}',
    '.uv-micwrap>.uv-micin:disabled{opacity:.4;cursor:not-allowed}',
    '.uv-micwrap+div[aria-live]:empty{display:none}',
    'button[aria-pressed="true"] .uv-micsvg{color:#ef4444}',
    '@keyframes uvpulse{0%{box-shadow:0 0 0 0 rgba(239,68,68,.5)}70%{box-shadow:0 0 0 10px rgba(239,68,68,0)}100%{box-shadow:0 0 0 0 rgba(239,68,68,0)}}',
  ].join('\n');
  var st = document.createElement('style');
  st.id = 'uv-mic-style';
  st.textContent = css;
  document.head.appendChild(st);

  function swapEmoji() {
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        MIC_RE.lastIndex = 0;
        if (!MIC_RE.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentElement;
        if (!p || /^(SCRIPT|STYLE|TEXTAREA|OPTION|TITLE)$/.test(p.tagName) || p.closest('[contenteditable="true"]')) return NodeFilter.FILTER_REJECT;
        var ok = p.closest('button,[role="button"],a,summary,label') || p.textContent.replace(MIC_RE, '').trim() === '';
        return ok ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });
    var list = [];
    while (w.nextNode()) list.push(w.currentNode);
    list.forEach(function (n) {
      var parts = n.nodeValue.split(MIC_RE);
      var frag = document.createDocumentFragment();
      parts.forEach(function (t, i) {
        if (i > 0) { var s = document.createElement('span'); s.className = 'uv-micsvg'; s.innerHTML = SMALL; frag.appendChild(s); }
        if (t) frag.appendChild(document.createTextNode(t));
      });
      n.parentNode.replaceChild(frag, n);
    });
  }

  function inside(btn) {
    if (btn.dataset.uvMi) return;
    var f = btn.previousElementSibling;
    if (!f) return;
    var isTa = f.tagName === 'TEXTAREA';
    var isIn = f.tagName === 'INPUT' && /^(text|search|url|email|)$/.test(f.type || '');
    if (!isTa && !isIn) return;
    btn.dataset.uvMi = '1';
    var w = document.createElement('div');
    w.className = 'uv-micwrap';
    f.parentNode.insertBefore(w, f);
    w.appendChild(f);
    w.appendChild(btn);
    btn.classList.add('uv-mic', 'uv-micin');
    if (isIn) btn.classList.add('uv-micinp');
    btn.removeAttribute('style');
    btn.innerHTML = BIG;
    if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Input suara');
  }

  function scan() {
    swapEmoji();
    [].slice.call(document.querySelectorAll('button')).forEach(function (b) {
      if (b.dataset.uvMi) return;
      var pure = !b.textContent.trim() && (b.querySelector('.uv-micsvg') || b.classList.contains('uv-mic'));
      if (pure) inside(b);
    });
  }

  var raf;
  new MutationObserver(function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); })
    .observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', function () { setTimeout(scan, 250); }, true);
  window.addEventListener('load', scan);
  scan();
})();
