// Umaira membuat file (.docx, .pdf, .pptx) langsung dari obrolan.
// Pola sama dengan edit gambar: dicek sebelum /api/chat, balasan memuat token ⟦umairafile:ID⟧.
import crypto from "node:crypto";
import express from "express";
import { fileSave, fileGet } from "./db.js";

const FORMATS = {
  docx: { label: "Dokumen Word", mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
  pdf: { label: "PDF", mime: "application/pdf" },
  pptx: { label: "Presentasi PowerPoint", mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }
};
const PER_HOUR = 10;
const hits = new Map();

/* ---------- deteksi maksud ---------- */
export function parseIntent(text) {
  const t = String(text || "").toLowerCase();
  if (!t || t.length > 4000) return null;
  const cv = /\b(?:cv|curriculum vit(?:a|ae)|curriclum vita|resume|daftar riwayat hidup|surat lamaran)\b/.test(t);
  if (/\b(?:cara|bagaimana|gimana|kenapa|mengapa|apa itu|apakah|jelaskan|tutorial)\b/.test(t)) return null;
  if (!cv && /\b(?:python|javascript|kode|script|skrip|program|fungsi|library|npm|node|html|css|api)\b/.test(t)) return null;
  const out = /\b(?:(?:buat|bikin|susun|generate|jadi|menjadi|jadikan|ubah|konversi|convert|ekspor|export)(?:kan|in)?|file|berupa|format|bentuk|dalam)\s+(?:\S+\s+){0,3}?(?:word|docx?|pdf|pptx?|power ?point|presentasi|slide)\b/;
  const make = /\b(?:buat|bikin|susun|generate)(?:kan|in)?\b/;
  if (!(out.test(t) || (cv && make.test(t)))) return null;
  const f = [];
  if (/\b(?:word|docx?)\b/.test(t)) f.push("docx");
  if (/\bpdf\b/.test(t)) f.push("pdf");
  if (/\b(?:pptx?|power ?point|presentasi|slide)\b/.test(t)) f.push("pptx");
  return { formats: f.length ? f : ["docx", "pdf"], cv, photo: /\b(?:foto|photo|gambar)\b/.test(t) };
}

/* ---------- ukuran foto (JPEG/PNG) tanpa pustaka tambahan ---------- */
export function imageDims(b) {
  try {
    if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), mime: "image/png" };
    if (b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i < b.length - 9) {
        if (b[i] !== 0xff) { i++; continue; }
        const m = b[i + 1];
        if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7) || m === 0xff) { i += m === 0xff ? 1 : 2; continue; }
        if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7), mime: "image/jpeg" };
        i += 2 + b.readUInt16BE(i + 2);
      }
    }
  } catch {}
  return null;
}
const fit = (p, bw, bh) => { const s = Math.min(bw / p.w, bh / p.h); return { buf: p.buf, mime: p.mime, w: Math.max(1, Math.round(p.w * s * 100) / 100), h: Math.max(1, Math.round(p.h * s * 100) / 100) }; };
const b64of = (s) => String(s || "").replace(/^data:[^;]+;base64,/, "");

/* ---------- AI (Gemini) ---------- */
async function askAi(text, messages, atts, intent) {
  const key = process.env.GEMINI_API_KEY;
  const models = [process.env.GEMINI_MODEL || "gemini-2.5-flash", ...String(process.env.GEMINI_FALLBACK_MODELS || "").split(",")].map((s) => s.trim()).filter(Boolean);
  const hist = messages.slice(-9, -1).map((m) => (m.role === "user" ? "Pengguna: " : "Umaira: ") + String(m.content || "").replace(/\u27e6[^\u27e7]*\u27e7/g, "").slice(0, 1500)).join("\n");
  const system = "Kamu pembuat dokumen berbahasa Indonesia. Susun isi file sesuai permintaan terakhir pengguna, memakai riwayat percakapan dan lampiran. " +
    "JANGAN mengarang data pribadi (nama, kontak, tempat kerja, tahun); jika belum diketahui tulis placeholder dalam kurung siku, misalnya [Nomor telepon]. " +
    'Balas HANYA JSON valid: {"title":"judul","name":"nama orang (khusus CV) atau kosong","contact":"satu baris kontak atau kosong","sections":[{"h":"judul bagian","body":"paragraf opsional","points":["poin singkat"]}]}. ' +
    (intent.cv ? 'Ini CV: "title" isi "CURRICULUM VITAE"; bagian Profil, Pengalaman Kerja, Pendidikan, Keahlian, dan lain-lain yang relevan. ' : "") +
    (intent.formats.includes("pptx") ? "Untuk presentasi: 5 sampai 8 bagian, tiap bagian 3 sampai 5 poin singkat. " : "");
  const parts = [{ text: (hist ? "Riwayat percakapan:\n" + hist + "\n\n" : "") + "Permintaan terakhir:\n" + text }];
  for (const a of atts.slice(0, 3)) parts.push({ inlineData: { mimeType: a.mimeType, data: b64of(a.data) } });
  let lastErr;
  for (const m of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(m) + ":generateContent", {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: "user", parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.6 } }),
          signal: AbortSignal.timeout(90000)
        });
        if (!r.ok) { lastErr = new Error("HTTP " + r.status); if ([429, 500, 503].includes(r.status)) break; throw lastErr; }
        const j = await r.json();
        const txt = (j.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("").replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
        return normalize(JSON.parse(txt));
      } catch (e) { lastErr = e; if (e.name === "TypeError" || e.name === "TimeoutError") { await new Promise((z) => setTimeout(z, 1200)); continue; } break; }
    }
  }
  throw lastErr || new Error("AI tidak merespons");
}
function normalize(d) {
  const sections = (Array.isArray(d.sections) ? d.sections : []).slice(0, 14).map((s) => ({
    h: String(s.h || "").slice(0, 120), body: String(s.body || "").slice(0, 2500),
    points: (Array.isArray(s.points) ? s.points : []).slice(0, 8).map((p) => String(p).slice(0, 220))
  })).filter((s) => s.h);
  if (!sections.length) throw new Error("Isi kosong");
  return { title: String(d.title || "Dokumen").slice(0, 120), name: String(d.name || "").slice(0, 100), contact: String(d.contact || "").slice(0, 200), sections };
}

/* ---------- pembuat file (pustaka dimuat saat dibutuhkan) ---------- */
const cl = (s) => String(s).replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF\u2018\u2019\u201C\u201D\u2013\u2014\u2022\u2026\u20AC]/g, "");

async function makeDocx(d, photo) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun, AlignmentType } = await import("docx");
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const nob = { top: none, bottom: none, left: none, right: none };
  const head = [new Paragraph({ children: [new TextRun({ text: d.title, bold: true, size: 36, color: "1F3A5F" })], spacing: { after: 80 } })];
  if (d.name) head.push(new Paragraph({ children: [new TextRun({ text: d.name, bold: true, size: 30 })] }));
  if (d.contact) head.push(new Paragraph({ children: [new TextRun({ text: d.contact, size: 20, color: "555555" })], spacing: { after: 120 } }));
  const kids = [];
  if (photo) {
    const p = fit(photo, 113, 151);
    kids.push(new Table({
      width: { size: 9200, type: WidthType.DXA }, columnWidths: [7000, 2200], borders: { ...nob, insideHorizontal: none, insideVertical: none },
      rows: [new TableRow({ children: [
        new TableCell({ width: { size: 7000, type: WidthType.DXA }, borders: nob, children: head }),
        new TableCell({ width: { size: 2200, type: WidthType.DXA }, borders: nob, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new ImageRun({ data: p.buf, transformation: { width: p.w, height: p.h } })] })] })
      ] })]
    }));
  } else kids.push(...head);
  for (const s of d.sections) {
    kids.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 80 }, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "1F3A5F", space: 1 } }, children: [new TextRun({ text: s.h.toUpperCase(), bold: true, color: "1F3A5F", size: 24 })] }));
    if (s.body) kids.push(new Paragraph({ text: s.body, spacing: { after: 100 } }));
    for (const p of s.points) kids.push(new Paragraph({ text: p, bullet: { level: 0 } }));
  }
  return Packer.toBuffer(new Document({ sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 1100, right: 1100 } } }, children: kids }] }));
}

async function makePdf(d, photo) {
  const PDFDocument = (await import("pdfkit")).default;
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50, info: { Title: cl(d.title) } });
    const ch = []; doc.on("data", (c) => ch.push(c)); doc.on("end", () => resolve(Buffer.concat(ch))); doc.on("error", reject);
    const W = 495, p = photo ? fit(photo, 85, 113) : null, tw = p ? W - p.w - 16 : W, y0 = doc.y;
    doc.font("Helvetica-Bold").fontSize(20).fillColor("#1F3A5F").text(cl(d.title), 50, y0, { width: tw });
    if (d.name) doc.moveDown(0.2).fontSize(15).fillColor("#000000").text(cl(d.name), 50, doc.y, { width: tw });
    if (d.contact) doc.moveDown(0.2).font("Helvetica").fontSize(10).fillColor("#555555").text(cl(d.contact), 50, doc.y, { width: tw });
    if (p) { doc.image(p.buf, 50 + W - p.w, y0, { width: p.w, height: p.h }); doc.y = Math.max(doc.y, y0 + p.h); }
    doc.moveDown(0.8);
    for (const s of d.sections) {
      doc.font("Helvetica-Bold").fontSize(12).fillColor("#1F3A5F").text(cl(s.h).toUpperCase(), 50, doc.y, { width: W });
      const y = doc.y + 1; doc.moveTo(50, y).lineTo(545, y).lineWidth(0.7).strokeColor("#1F3A5F").stroke(); doc.moveDown(0.4);
      doc.font("Helvetica").fontSize(10.5).fillColor("#000000");
      if (s.body) doc.text(cl(s.body), 50, doc.y, { width: W }).moveDown(0.3);
      for (const t of s.points) doc.text("\u2022  " + cl(t), 50, doc.y, { width: W });
      doc.moveDown(0.6);
    }
    doc.end();
  });
}

async function makePptx(d, photo) {
  const pptxgen = (await import("pptxgenjs")).default;
  const pres = new pptxgen(); pres.layout = "LAYOUT_16x9";
  const t = pres.addSlide(); t.background = { color: "10231C" };
  t.addText(d.title, { x: 0.6, y: 1.5, w: photo ? 6.4 : 8.8, h: 1.2, fontSize: 32, bold: true, color: "FFFFFF" });
  const sub = [d.name, d.contact].filter(Boolean).join("\n");
  if (sub) t.addText(sub, { x: 0.6, y: 2.8, w: photo ? 6.4 : 8.8, h: 1.2, fontSize: 16, color: "D8E6DE", valign: "top" });
  if (photo) { const p = fit(photo, 1.8, 2.4); t.addImage({ data: p.mime + ";base64," + p.buf.toString("base64"), x: 10 - 0.6 - p.w - 0.4, y: 1.5, w: p.w, h: p.h }); }
  for (const s of d.sections) {
    const sl = pres.addSlide();
    sl.addText(s.h, { x: 0.6, y: 0.4, w: 8.8, h: 0.9, fontSize: 26, bold: true, color: "0F6B4F" });
    const pts = s.points.length ? s.points : [s.body];
    sl.addText(pts.map((x) => ({ text: x, options: { bullet: true, breakLine: true } })), { x: 0.7, y: 1.5, w: 8.6, h: 3.6, fontSize: 20, color: "10231C", valign: "top" });
  }
  return pres.write({ outputType: "nodebuffer" });
}

const slugOf = (s) => String(s || "").normalize("NFKD").toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 24).replace(/^-|-$/g, "");
const storeName = (uid, hex, ext) => "chatfile-" + String(uid).replace(/[^\w-]/g, "_") + "-" + hex + "-" + ext;

/* ---------- middleware obrolan ---------- */
export function createChatFileMiddleware({ currentUser }) {
  return async (req, res, next) => {
    try {
      if (req.method !== "POST" || !req.body || typeof req.body !== "object") return next();
      const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
      const last = messages[messages.length - 1];
      const text = typeof last?.content === "string" ? last.content : "";
      const intent = parseIntent(text);
      if (!intent) return next();
      const user = await currentUser(req);
      if (!user?.id) return next();
      const now = Date.now();
      let b = hits.get(user.id);
      if (!b || b.reset < now) { b = { n: 0, reset: now + 3600 * 1000 }; hits.set(user.id, b); }
      if (++b.n > PER_HOUR) return res.status(429).json({ error: "Batas pembuatan file tercapai (" + PER_HOUR + " per jam). Coba lagi nanti." });
      if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: "Pembuatan file belum dikonfigurasi (GEMINI_API_KEY)." });

      const raw = Array.isArray(req.body.attachments) ? req.body.attachments : [];
      const atts = raw.filter((a) => typeof a?.data === "string" && /^(image\/|application\/pdf$)/.test(String(a.mimeType || "")) && a.data.length < 11e6);
      let photo = null, photoNote = "";
      if (intent.cv || intent.photo) {
        const img = atts.find((a) => /^image\//.test(a.mimeType));
        if (img) {
          const buf = Buffer.from(b64of(img.data), "base64"), dm = imageDims(buf);
          if (dm && dm.w > 0 && dm.h > 0) photo = { buf, w: dm.w, h: dm.h, mime: dm.mime };
          else photoNote = "\n\nFoto tidak bisa dipasang karena formatnya bukan JPG atau PNG.";
        }
      }
      const data = await askAi(text, messages, atts, intent);
      const hex = crypto.randomBytes(6).toString("hex"), slug = slugOf(data.name || data.title);
      const made = [];
      for (const ext of intent.formats) {
        const buf = ext === "docx" ? await makeDocx(data, photo) : ext === "pdf" ? await makePdf(data, photo) : await makePptx(data, photo);
        await fileSave(storeName(user.id, hex, ext), buf, FORMATS[ext].mime);
        made.push("\u27e6umairafile:" + (slug ? slug + "-" : "") + hex + "-" + ext + "\u27e7");
      }
      const message = "Berikut file yang sudah saya buat:\n\n" + made.join("\n\n") +
        "\n\nData yang belum saya ketahui saya beri tanda [seperti ini]. Lengkapi dulu sebelum dikirim." + (photo ? "" : photoNote);
      return res.json({ mode: "file-gen", provider: "gemini", version: "1.0.0", message });
    } catch (err) {
      console.error("[chatfile] gagal:", err?.message || err);
      return res.status(500).json({ error: "Pembuatan file gagal. Coba lagi sebentar lagi." });
    }
  };
}

/* ---------- unduh: GET /api/chat-files/:id ---------- */
export function createChatFilesRouter({ currentUser }) {
  const router = express.Router();
  router.get("/:id", async (req, res) => {
    try {
      const user = await currentUser(req);
      if (!user?.id) return res.status(401).json({ error: "Masuk dulu." });
      const m = /^(?:([a-z0-9-]{1,30})-)?([a-f0-9]{12})-(docx|pdf|pptx)$/.exec(String(req.params.id));
      if (!m) return res.status(404).json({ error: "File tidak ditemukan." });
      const f = await fileGet(storeName(user.id, m[2], m[3]));
      if (!f) return res.status(404).json({ error: "File tidak ditemukan." });
      res.set({ "Content-Type": FORMATS[m[3]].mime, "Content-Disposition": 'attachment; filename="' + (m[1] || "dokumen") + "." + m[3] + '"', "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
      res.send(Buffer.from(f.data));
    } catch (e) { console.error("[chatfile] unduh gagal:", e?.message || e); res.status(500).json({ error: "Gagal mengunduh file." }); }
  });
  return router;
}
