// POST /api/docgen  {type:"word"|"ppt", prompt}  ->  file .docx / .pptx
// Memakai GEMINI_API_KEY, GEMINI_MODEL, GEMINI_FALLBACK_MODELS yang sudah ada di .env Anda.
import express from "express";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import pptxgen from "pptxgenjs";

const hits = new Map();
function limited(key, max, windowMs) {
  const t = Date.now();
  const h = hits.get(key);
  if (!h || h.reset < t) { hits.set(key, { n: 1, reset: t + windowMs }); return false; }
  return ++h.n > max;
}

async function askAi(type, prompt) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY belum diisi");
  const models = [process.env.GEMINI_MODEL || "gemini-2.5-flash", ...String(process.env.GEMINI_FALLBACK_MODELS || "").split(",")]
    .map((s) => s.trim()).filter(Boolean);
  const system = "Kamu penulis profesional berbahasa Indonesia. Ubah permintaan pengguna menjadi isi " +
    (type === "ppt" ? "presentasi 5 sampai 8 slide" : "dokumen 4 sampai 8 bagian") +
    '. Balas HANYA JSON valid: {"title":"judul","sections":[{"h":"judul bagian","body":"paragraf 2-4 kalimat","points":["poin singkat","..."]}]}. ' +
    "Setiap bagian wajib punya 3 sampai 5 poin singkat. Jangan menulis apa pun di luar JSON.";
  let lastErr;
  for (const m of models) {
    try {
      const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(m) + ":generateContent", {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
        }),
        signal: AbortSignal.timeout(60000)
      });
      if (!r.ok) { lastErr = new Error("HTTP " + r.status); if ([429, 500, 503].includes(r.status)) continue; throw lastErr; }
      const j = await r.json();
      const txt = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
      return normalize(JSON.parse(txt));
    } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error("AI tidak merespons");
}

function normalize(d) {
  const secs = (Array.isArray(d.sections) ? d.sections : []).slice(0, 12).map((s) => ({
    h: String(s.h || "").slice(0, 120),
    body: String(s.body || "").slice(0, 2000),
    points: (Array.isArray(s.points) ? s.points : []).slice(0, 6).map((p) => String(p).slice(0, 200))
  })).filter((s) => s.h);
  if (!secs.length) throw new Error("Isi kosong");
  return { title: String(d.title || "Dokumen").slice(0, 120), sections: secs };
}

async function makeDocx(d) {
  const kids = [new Paragraph({ text: d.title, heading: HeadingLevel.TITLE })];
  for (const s of d.sections) {
    kids.push(new Paragraph({ text: s.h, heading: HeadingLevel.HEADING_1 }));
    if (s.body) kids.push(new Paragraph({ text: s.body, spacing: { after: 120 } }));
    for (const p of s.points) kids.push(new Paragraph({ text: p, bullet: { level: 0 } }));
  }
  return Packer.toBuffer(new Document({ sections: [{ children: kids }] }));
}

async function makePptx(d) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  const t = pres.addSlide();
  t.background = { color: "10231C" };
  t.addText(d.title, { x: 0.6, y: 1.8, w: 8.8, h: 1.6, fontSize: 34, bold: true, color: "FFFFFF" });
  for (const s of d.sections) {
    const sl = pres.addSlide();
    sl.addText(s.h, { x: 0.6, y: 0.4, w: 8.8, h: 0.9, fontSize: 26, bold: true, color: "0F6B4F" });
    const pts = s.points.length ? s.points : [s.body];
    sl.addText(pts.map((p) => ({ text: p, options: { bullet: true, breakLine: true } })), { x: 0.7, y: 1.5, w: 8.6, h: 3.6, fontSize: 20, color: "10231C", valign: "top" });
  }
  return pres.write({ outputType: "nodebuffer" });
}

const slug = (s) => String(s || "dokumen").normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").toLowerCase().slice(0, 50) || "dokumen";

export function createDocgenRouter({ currentUser }) {
  const router = express.Router();
  router.post("/", async (req, res) => {
    try {
      const user = await currentUser(req);
      if (!user) return res.status(401).json({ error: "Masuk dulu." });
      if (limited("doc:" + (user.id || user.email || "u"), 10, 60 * 60 * 1000)) {
        return res.status(429).json({ error: "Batas 10 file per jam tercapai. Coba lagi nanti." });
      }
      const type = req.body?.type === "ppt" ? "ppt" : req.body?.type === "word" ? "word" : "";
      const prompt = String(req.body?.prompt || "").trim();
      if (!type || prompt.length < 5 || prompt.length > 3000) {
        return res.status(400).json({ error: "Pilih jenis file dan tulis perintah 5 sampai 3000 karakter." });
      }
      const data = await askAi(type, prompt);
      const buf = type === "word" ? await makeDocx(data) : await makePptx(data);
      const ext = type === "word" ? "docx" : "pptx";
      res.set({
        "Content-Type": type === "word" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": 'attachment; filename="' + slug(data.title) + "." + ext + '"',
        "Cache-Control": "no-store"
      });
      res.send(buf);
    } catch (e) {
      console.error("docgen gagal:", e.message);
      res.status(502).json({ error: "Gagal membuat file. Coba lagi sebentar lagi." });
    }
  });
  return router;
}
