/*
 * umaira-voice.js
 * Input suara bahasa Indonesia memakai Web Speech API bawaan browser (gratis).
 * Opsional: bacakan jawaban dengan speechSynthesis.
 *
 *   UmairaVoice.attach({
 *     inputEl: document.querySelector('#chat-input'),   // textarea / input chat
 *     buttonEl: document.querySelector('#mic-btn'),     // tombol mikrofon
 *     lang: 'id-ID',                                     // opsional
 *     onFinal: (text) => {},                             // opsional, mis. kirim otomatis
 *   });
 *
 * Catatan: butuh Chrome/Edge/Safari. Firefox belum mendukung. Halaman harus
 * HTTPS atau localhost/127.0.0.1 agar mikrofon boleh dipakai.
 */
(function () {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const supported = !!SR;

  const ERRORS = {
    'not-allowed': 'Izin mikrofon ditolak. Aktifkan di pengaturan situs browser.',
    'service-not-allowed': 'Izin mikrofon ditolak. Aktifkan di pengaturan situs browser.',
    'no-speech': 'Suara tidak terdengar. Coba lagi.',
    'audio-capture': 'Mikrofon tidak ditemukan.',
    network: 'Pengenalan suara butuh koneksi internet.',
  };

  function attach(o) {
    const btn = o.buttonEl;
    const input = o.inputEl;
    if (!supported) {
      btn.disabled = true;
      btn.title = 'Browser ini belum mendukung input suara.';
      return { supported: false };
    }

    const rec = new SR();
    rec.lang = o.lang || 'id-ID';
    rec.interimResults = true;
    rec.continuous = false;

    let listening = false;
    let base = '';
    const status = document.createElement('div');
    status.setAttribute('aria-live', 'polite');
    status.style.cssText = 'font-size:12px;opacity:.7;min-height:16px';
    btn.insertAdjacentElement('afterend', status);

    const setUI = (on, msg) => {
      listening = on;
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on ? 'Berhenti merekam' : 'Mulai input suara');
      btn.style.outline = on ? '2px solid #e24b4a' : '';
      status.textContent = msg || (on ? 'Mendengarkan…' : '');
    };

    rec.onresult = (e) => {
      let interim = '', final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t; else interim += t;
      }
      if (final) base = (base + ' ' + final).trim();
      input.value = (base + ' ' + interim).trim();
      input.dispatchEvent(new Event('input', { bubbles: true }));
      if (final && o.onFinal) o.onFinal(input.value);
    };
    rec.onerror = (e) => setUI(false, ERRORS[e.error] || 'Input suara gagal (' + e.error + ').');
    rec.onend = () => { if (listening) setUI(false); };

    btn.addEventListener('click', () => {
      if (listening) { rec.stop(); setUI(false); return; }
      base = input.value.trim();
      try { rec.start(); setUI(true); } catch (e) { setUI(false, 'Tidak bisa memulai. Coba lagi.'); }
    });

    return { supported: true, stop: () => rec.stop() };
  }

  // Bacakan teks (jawaban AI). Markdown dibersihkan sekadarnya.
  function speak(text, lang) {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const clean = String(text).replace(/```[\s\S]*?```/g, ' (blok kode dilewati) ').replace(/[*_`#>\[\]]/g, '');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = lang || 'id-ID';
    speechSynthesis.speak(u);
    return true;
  }
  const stopSpeaking = () => 'speechSynthesis' in window && speechSynthesis.cancel();

  window.UmairaVoice = { attach, speak, stopSpeaking, supported };
})();
