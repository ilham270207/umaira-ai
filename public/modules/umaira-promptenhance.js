/*
 * umaira-promptenhance.js
 * Menyempurnakan deskripsi gambar sebelum dikirim ke AI Horde:
 * terjemah ke Inggris, tambah detail visual, dan sarankan "hindari".
 *
 * Anda cukup menyediakan satu fungsi askAI(messages) -> Promise<string>
 * yang memanggil model chat Anda (messages = [{role, content}, ...]).
 *
 *   UmairaPromptEnhance.attach({
 *     promptEl:   document.querySelector('#img-prompt'),     // textarea "Deskripsi gambar"
 *     negativeEl: document.querySelector('#img-negative'),   // textarea "Hindari"
 *     styleEl:    document.querySelector('#img-style'),      // select "Gaya gambar" (opsional)
 *     askAI: (messages) => callYourChatApi(messages),
 *   });
 */
(function () {
  const STYLE_HINTS = {
    'pixel art': 'pixel art, 16-bit, crisp pixels, limited palette',
    anime: 'anime style, clean line art, vibrant colors',
    realistis: 'photorealistic, natural lighting, 85mm lens, high detail',
    'cat air': 'watercolor painting, soft washes, paper texture',
    '3d': '3D render, octane render, soft studio lighting',
    ilustrasi: 'digital illustration, detailed, concept art',
  };
  const BASE_NEGATIVE = 'text, watermark, signature, blurry, low quality, deformed, extra fingers, cropped';

  const SYSTEM =
    'Kamu penyempurna prompt untuk model gambar Stable Diffusion. Ubah deskripsi pengguna ' +
    '(boleh bahasa Indonesia) menjadi prompt bahasa Inggris, satu baris, maksimal 60 kata: ' +
    'subjek, suasana, komposisi, pencahayaan, gaya. Jangan menambah objek yang bertentangan dengan permintaan. ' +
    'Balas HANYA JSON: {"prompt":"...","negative":"..."} tanpa teks lain.';

  function parseJSON(text) {
    const m = String(text).match(/\{[\s\S]*\}/);
    if (!m) throw new Error('Balasan tidak berisi JSON');
    const o = JSON.parse(m[0]);
    if (!o.prompt) throw new Error('Prompt kosong');
    return { prompt: String(o.prompt).trim(), negative: String(o.negative || '').trim() };
  }

  function localFallback(prompt, style) {
    const hint = STYLE_HINTS[(style || '').toLowerCase()] || '';
    return { prompt: [prompt.trim(), hint, 'highly detailed, sharp focus'].filter(Boolean).join(', '), negative: BASE_NEGATIVE };
  }

  async function enhance(prompt, opts) {
    opts = opts || {};
    if (!prompt || !prompt.trim()) throw new Error('Tulis deskripsi gambar dulu.');
    if (typeof opts.askAI !== 'function') return localFallback(prompt, opts.style);
    try {
      const msgs = [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: 'Deskripsi: ' + prompt.trim() + (opts.style ? '\nGaya: ' + opts.style : '') },
      ];
      const r = parseJSON(await opts.askAI(msgs));
      if (!r.negative) r.negative = BASE_NEGATIVE;
      return r;
    } catch (e) {
      return localFallback(prompt, opts.style); // AI gagal / bukan JSON: pakai aturan lokal
    }
  }

  function attach(o) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '✦ Sempurnakan';
    btn.style.cssText = 'font-size:12px;padding:4px 10px;margin:6px 0;border-radius:999px;border:1px solid rgba(128,128,128,.4);background:transparent;color:inherit;cursor:pointer';
    const box = document.createElement('div');
    box.style.cssText = 'display:none;font-size:12px;border:1px solid rgba(128,128,128,.35);border-radius:8px;padding:8px;margin-bottom:6px';
    o.promptEl.insertAdjacentElement('afterend', box);
    o.promptEl.insertAdjacentElement('afterend', btn);

    btn.addEventListener('click', async () => {
      const original = o.promptEl.value;
      btn.disabled = true; btn.textContent = 'Menyempurnakan…';
      try {
        const r = await enhance(original, { askAI: o.askAI, style: o.styleEl && o.styleEl.selectedOptions[0] ? o.styleEl.selectedOptions[0].text : '' });
        box.style.display = 'block';
        box.innerHTML = '';
        const t = document.createElement('div');
        t.textContent = r.prompt;
        const n = document.createElement('div');
        n.style.opacity = '.65'; n.textContent = 'Hindari: ' + r.negative;
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;gap:6px;margin-top:6px';
        const ok = document.createElement('button'); ok.type = 'button'; ok.textContent = 'Gunakan';
        const no = document.createElement('button'); no.type = 'button'; no.textContent = 'Batal';
        ok.onclick = () => {
          o.promptEl.value = r.prompt;
          if (o.negativeEl && !o.negativeEl.value.trim()) o.negativeEl.value = r.negative;
          box.style.display = 'none';
        };
        no.onclick = () => { box.style.display = 'none'; };
        row.append(ok, no);
        box.append(t, n, row);
      } catch (e) {
        box.style.display = 'block'; box.textContent = e.message;
      } finally {
        btn.disabled = false; btn.textContent = '✦ Sempurnakan';
      }
    });
  }

  window.UmairaPromptEnhance = { enhance, attach };
})();
