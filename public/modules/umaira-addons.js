/*
 * umaira-addons.js
 * Perekat: memasang pratinjau kode, penyempurna prompt gambar, input suara,
 * dan pencarian web ke Umaira TANPA mengubah app.js / workspace-modules.js.
 * Semua bersifat idempoten dan aman jika elemen yang dicari tidak ada.
 */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const safe = (fn) => { try { fn(); } catch (e) { console.warn('[umaira-addons]', e); } };

  // Panggil model chat yang sama dengan Umaira (/api/chat). Server hanya menerima
  // pesan user, jadi instruksi sistem digabung ke satu pesan.
  async function askAI(msgs) {
    const text = msgs.map((m) => m.content).join('\n\n');
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Umaira-Skip': '1' },
      body: JSON.stringify({ messages: [{ role: 'user', content: text }] }),
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'AI gagal menjawab.');
    return d.message;
  }

  /* ---------- 1. Pratinjau kode di blok kode ---------- */
  const LANGS = { html: 'html', css: 'css', javascript: 'javascript', js: 'javascript' };

  function blockInfo(btn) {
    let c = btn.parentElement;
    for (let i = 0; i < 6 && c; i++) {
      if (c.querySelector('pre,code')) break;
      c = c.parentElement;
    }
    if (!c || !c.querySelector('pre,code')) return null;
    const codeEl = c.querySelector('pre code') || c.querySelector('pre') || c.querySelector('code');
    const code = codeEl.textContent;
    let lang = '';
    const m = (codeEl.className || '').match(/language-(\w+)/);
    if (m) lang = m[1].toLowerCase();
    if (!lang) {
      for (const el of c.querySelectorAll('span,div,small,p')) {
        if (el.children.length === 0 && LANGS[el.textContent.trim().toLowerCase()]) {
          lang = el.textContent.trim().toLowerCase();
          break;
        }
      }
    }
    if (!lang && /<(!doctype|html|body|div|script|style)\b/i.test(code)) lang = 'html';
    return { c, lang: LANGS[lang] || lang, code };
  }

  function openPreview(blocks) {
    let dlg = $('#uv-dlg');
    if (!dlg) {
      dlg = document.createElement('div');
      dlg.id = 'uv-dlg';
      dlg.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;padding:12px';
      dlg.innerHTML =
        '<div style="background:#101014;color:#eee;border:1px solid #444;border-radius:12px;padding:12px;width:min(720px,100%);max-height:92vh;overflow:auto">' +
        '<div style="display:flex;justify-content:flex-end;margin-bottom:6px"><button type="button" class="uv-close">Tutup</button></div>' +
        '<div class="uv-host"></div></div>';
      dlg.addEventListener('click', (e) => {
        if (e.target === dlg || e.target.classList.contains('uv-close')) {
          dlg.style.display = 'none';
          dlg.querySelector('.uv-host').innerHTML = '';
        }
      });
      document.body.appendChild(dlg);
    }
    dlg.style.display = 'flex';
    UmairaPreview.mount(dlg.querySelector('.uv-host')).render(blocks);
  }

  function addPreviewButtons() {
    if (!window.UmairaPreview) return;
    document.querySelectorAll('button').forEach((btn) => {
      if (btn.dataset.uvPv || btn.textContent.trim() !== 'Salin') return;
      btn.dataset.uvPv = '1';
      const info = blockInfo(btn);
      if (!info || !['html', 'css', 'javascript'].includes(info.lang)) return;
      const pv = document.createElement('button');
      pv.type = 'button';
      pv.className = btn.className;
      pv.textContent = 'Pratinjau';
      pv.addEventListener('click', () => {
        const scope = info.c.parentElement || document;
        const blocks = [...scope.querySelectorAll('button')]
          .filter((b) => b.textContent.trim() === 'Salin')
          .map(blockInfo)
          .filter((b) => b && ['html', 'css', 'javascript'].includes(b.lang))
          .map((b) => ({ lang: b.lang, code: b.code }));
        openPreview(blocks.length ? blocks : [{ lang: info.lang, code: info.code }]);
      });
      btn.insertAdjacentElement('afterend', pv);
    });
  }

  /* ---------- 4. Prompt gambar disempurnakan (Studio gambar) ---------- */
  function byPlaceholder(sub) {
    return [...document.querySelectorAll('textarea,input')].find((e) => (e.placeholder || '').toLowerCase().includes(sub));
  }
  function attachEnhance() {
    if (!window.UmairaPromptEnhance) return;
    const promptEl = byPlaceholder('kota futuristik');
    if (!promptEl || promptEl.dataset.uvEnh) return;
    promptEl.dataset.uvEnh = '1';
    const label = [...document.querySelectorAll('label,div,span')].find((l) => l.children.length === 0 && l.textContent.trim() === 'Gaya gambar');
    const styleEl = label && ((label.nextElementSibling && label.nextElementSibling.tagName === 'SELECT' ? label.nextElementSibling : null) || (label.parentElement && label.parentElement.querySelector('select')));
    UmairaPromptEnhance.attach({ promptEl, negativeEl: byPlaceholder('watermark'), styleEl, askAI });
  }

  /* ---------- 6. Input suara ---------- */
  function attachMics() {
    if (!window.UmairaVoice || !UmairaVoice.supported) return;
    document.querySelectorAll('textarea').forEach((el) => {
      if (el.dataset.uvMic || el.offsetParent === null || el.disabled || el.readOnly) return;
      if (el.closest('[class*="composer" i]') || /tanyakan apa saja/i.test(el.placeholder || '')) return;
      el.dataset.uvMic = '1';
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = '🎤';
      b.title = 'Input suara';
      b.style.cssText = 'font-size:14px;padding:2px 8px;border-radius:999px;border:1px solid rgba(128,128,128,.4);background:transparent;color:inherit;cursor:pointer;margin:4px 0;display:block';
      el.insertAdjacentElement('afterend', b);
      UmairaVoice.attach({ inputEl: el, buttonEl: b });
    });
  }

  /* ---------- 5. Pencarian web ---------- */
  function uvToast(msg, ms) {
    let t = document.getElementById('uv-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'uv-toast';
      t.setAttribute('role', 'status');
      t.style.cssText = 'position:fixed;right:12px;bottom:84px;z-index:9000;max-width:70vw;font-size:12px;padding:6px 12px;border-radius:999px;border:1px solid rgba(128,128,128,.5);background:rgba(20,20,20,.9);color:#eee;pointer-events:none;display:none';
      document.body.appendChild(t);
    }
    clearTimeout(t._h);
    t.textContent = msg;
    t.style.display = 'block';
    if (ms) t._h = setTimeout(() => { t.style.display = 'none'; }, ms);
  }
  function uvToastHide() { const t = document.getElementById('uv-toast'); if (t) t.style.display = 'none'; }

  if (window.UmairaWebSearch && !window.__uvFetchPatched) {
    window.__uvFetchPatched = true;
    const origFetch = window.fetch.bind(window);
    window.fetch = async function (input, init) {
      try {
        const url = typeof input === 'string' ? input : '';
        const h = (init && init.headers) || {};
        const skip = h['X-Umaira-Skip'] || (h.get && h.get('X-Umaira-Skip'));
        const isChat = /\/api\/chat(\?|$)/.test(url) && init && String(init.method || '').toUpperCase() === 'POST' && typeof init.body === 'string';
        if (isChat && !skip) {
          const body = JSON.parse(init.body);
          const msgs = Array.isArray(body.messages) ? body.messages : [];
          const last = msgs[msgs.length - 1];
          const text = last && typeof last.content === 'string' ? last.content : '';
          if (last && last.role === 'user' && text && UmairaWebSearch.shouldSearch(text)) {
            uvToast('Mencari di web…');
            const { system, sources, error } = await UmairaWebSearch.buildContext(text);
            if (system) uvToast('Web: ' + sources.length + ' sumber', 2500);
            else if (error) uvToast('Pencarian web gagal: ' + error, 7000);
            else uvToastHide();
            if (system) {
              last.content = text + system;
              const res = await origFetch(input, Object.assign({}, init, { body: JSON.stringify(body) }));
              if (res.ok && sources.length) {
                const data = await res.clone().json().catch(() => null);
                if (data && typeof data.message === 'string') {
                  data.message += '\n\nSumber web:\n' + sources.map((s) => s.n + '. [' + s.title + '](' + s.url + ')').join('\n');
                  return new Response(JSON.stringify(data), { status: res.status, headers: { 'Content-Type': 'application/json' } });
                }
              }
              return res;
            }
          }
        }
      } catch (e) { console.warn('[umaira-addons] web search dilewati:', e); }
      return origFetch(input, init);
    };
  }

  /* ---------- pemantau ---------- */
  function scan() {
    safe(addPreviewButtons);
    safe(attachEnhance);
    safe(attachMics);
  }
  let raf;
  new MutationObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(scan); })
    .observe(document.body, { childList: true, subtree: true });
  document.addEventListener('click', () => setTimeout(scan, 300), true);
  scan();
})();
