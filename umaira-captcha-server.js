// Verifikasi login/daftar. Memakai Google reCAPTCHA v2 ("Saya bukan robot") bila
// RECAPTCHA_SITE_KEY dan RECAPTCHA_SECRET_KEY ada di .env; bila tidak, kembali ke captcha gambar lama.
// Matikan darurat: tambahkan UMAIRA_CAPTCHA=off di .env lalu mulai ulang server.
import express from "express";
import crypto from "node:crypto";
import svgCaptcha from "svg-captcha";

const ON = String(process.env.UMAIRA_CAPTCHA || "on").toLowerCase() !== "off";
const SITE = String(process.env.RECAPTCHA_SITE_KEY || "").trim();
const SECRET = String(process.env.RECAPTCHA_SECRET_KEY || "").trim();
const GOOGLE = Boolean(SITE && SECRET);
const store = new Map();
const hits = new Map();
setInterval(() => {
  const t = Date.now();
  for (const [k, v] of store) if (v.exp < t) store.delete(k);
  for (const [k, v] of hits) if (v.reset < t) hits.delete(k);
}, 60000).unref();

function limited(key, max, windowMs) {
  const t = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < t) { hits.set(key, { n: 1, reset: t + windowMs }); return false; }
  return ++h.n > max;
}

async function verifyGoogle(token, ip) {
  const body = new URLSearchParams({ secret: SECRET, response: token });
  if (ip) body.set("remoteip", ip);
  const r = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
    signal: AbortSignal.timeout(8000)
  });
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

export const captchaRouter = express.Router();

captchaRouter.get("/captcha", (req, res) => {
  res.set("Cache-Control", "no-store");
  if (!ON) return res.json({ enabled: false });
  if (limited("cap:" + (req.ip || "x"), 40, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Terlalu banyak permintaan captcha. Coba lagi nanti." });
  }
  if (GOOGLE) return res.json({ enabled: true, provider: "recaptcha", siteKey: SITE });
  if (store.size > 5000) return res.status(503).json({ error: "Captcha sibuk. Coba lagi sebentar lagi." });
  const c = svgCaptcha.create({ size: 5, noise: 4, color: true, ignoreChars: "0oO1iIlL", width: 220, height: 70, fontSize: 56, background: "#F4F7F5" });
  const id = crypto.randomBytes(16).toString("hex");
  store.set(id, { t: c.text.toLowerCase(), exp: Date.now() + 3 * 60 * 1000 });
  res.json({ enabled: true, provider: "image", id, svg: c.data });
});

const GATED = new Set(["/login", "/register"]);
captchaRouter.use(async (req, res, next) => {
  if (!ON || req.method !== "POST" || !GATED.has(req.path)) return next();
  const b = req.body || {};
  if (GOOGLE) {
    try {
      const token = String(b.recaptchaToken || "");
      delete b.recaptchaToken; delete b.captchaId; delete b.captchaAnswer;
      if (!token || token.length > 4096) {
        return res.status(400).json({ error: "Centang \"Saya bukan robot\" terlebih dahulu.", captcha: true });
      }
      const g = await verifyGoogle(token, req.ip);
      if (!g || g.success !== true) {
        console.error("[recaptcha] ditolak:", JSON.stringify(g && g["error-codes"]));
        return res.status(400).json({ error: "Verifikasi gagal. Centang \"Saya bukan robot\" lagi.", captcha: true });
      }
      return next();
    } catch (e) {
      console.error("[recaptcha] gagal menghubungi Google:", e?.message || e);
      return res.status(503).json({ error: "Verifikasi sedang tidak tersedia. Coba lagi sebentar lagi.", captcha: true });
    }
  }
  const id = String(b.captchaId || "");
  const rec = store.get(id);
  store.delete(id); // sekali pakai
  const ans = String(b.captchaAnswer || "").trim().toLowerCase();
  if (!rec || rec.exp < Date.now() || rec.t !== ans) {
    return res.status(400).json({ error: "Jawaban captcha salah. Ketik huruf pada gambar yang baru.", captcha: true });
  }
  delete b.captchaId; delete b.captchaAnswer;
  next();
});
