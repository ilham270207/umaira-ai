/*
 * umaira-preview.js
 * Pratinjau kode live di Lab kode: ambil blok kode dari jawaban AI
 * (html/css/js), jalankan di iframe ber-sandbox, tampilkan console-nya.
 *
 * Pakai:
 *   const pv = UmairaPreview.mount(document.getElementById('preview-box'));
 *   pv.render(jawabanAIdalamMarkdown);
 */
(function () {
  const HOOK =
    '<script>(function(){function f(a){return a.map(function(x){try{return typeof x==="object"?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(" ")}' +
    '["log","warn","error"].forEach(function(k){var o=console[k];console[k]=function(){parent.postMessage({__umaira:1,k:k,m:f([].slice.call(arguments))},"*");o.apply(console,arguments)}});' +
    'addEventListener("error",function(e){parent.postMessage({__umaira:1,k:"error",m:e.message},"*")})})()' + '<' + '/script>';

  function extractBlocks(md) {
    const out = [];
    const re = /```([\w+-]*)\n([\s\S]*?)```/g;
    let m;
    while ((m = re.exec(md))) out.push({ lang: (m[1] || '').toLowerCase(), code: m[2] });
    return out;
  }

  function buildSrcdoc(blocks) {
    const pick = (...l) => blocks.filter((b) => l.includes(b.lang)).map((b) => b.code).join('\n');
    const html = pick('html');
    const css = pick('css');
    const js = pick('javascript', 'js');
    if (!html && !css && !js) return null;
    const isFull = /<html[\s>]/i.test(html);
    if (isFull) {
      // dokumen lengkap: sisipkan hook di awal <head> atau paling atas
      return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (h) => h + HOOK) : HOOK + html;
    }
    return '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      HOOK + '<style>body{font-family:system-ui,sans-serif;margin:12px}' + css + '</style></head><body>' +
      html + (js ? '<script>' + js.replace(/<\/script/gi, '<\\/script') + '<' + '/script>' : '') + '</body></html>';
  }

  function mount(container) {
    container.innerHTML =
      '<div class="up-bar" style="display:flex;gap:8px;align-items:center;margin-bottom:6px;font-size:12px">' +
      '<strong style="font-weight:500">Pratinjau</strong><span class="up-status" style="opacity:.6"></span>' +
      '<button type="button" class="up-reload" style="margin-left:auto">Muat ulang</button></div>' +
      '<iframe sandbox="allow-scripts" title="Pratinjau kode" style="width:100%;height:280px;border:1px solid rgba(128,128,128,.35);border-radius:8px;background:#fff"></iframe>' +
      '<pre class="up-console" style="margin:6px 0 0;padding:8px;max-height:120px;overflow:auto;font-size:12px;border:1px solid rgba(128,128,128,.35);border-radius:8px;white-space:pre-wrap"></pre>';
    const frame = container.querySelector('iframe');
    const con = container.querySelector('.up-console');
    const status = container.querySelector('.up-status');
    let last = null;

    window.addEventListener('message', (e) => {
      if (e.source !== frame.contentWindow || !e.data || !e.data.__umaira) return;
      const line = document.createElement('div');
      line.textContent = '[' + e.data.k + '] ' + e.data.m;
      if (e.data.k === 'error') line.style.color = '#e24b4a';
      con.appendChild(line);
    });

    function renderDoc(doc) {
      con.textContent = '';
      last = doc;
      frame.srcdoc = doc;
      status.textContent = 'berjalan';
    }

    container.querySelector('.up-reload').addEventListener('click', () => last && renderDoc(last));

    return {
      render(markdownOrBlocks) {
        const blocks = typeof markdownOrBlocks === 'string' ? extractBlocks(markdownOrBlocks) : markdownOrBlocks;
        const doc = buildSrcdoc(blocks);
        if (!doc) { status.textContent = 'tidak ada kode HTML/CSS/JS yang bisa dijalankan'; return false; }
        renderDoc(doc);
        return true;
      },
      clear() { frame.srcdoc = ''; con.textContent = ''; status.textContent = ''; last = null; },
    };
  }

  window.UmairaPreview = { mount, extractBlocks, buildSrcdoc };
})();
