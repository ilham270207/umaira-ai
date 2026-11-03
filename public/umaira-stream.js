/* umaira-stream.js - tampilkan jawaban AI bertahap di gelembung "mengetik" */
(function () {
  var BOX = "um-stream-box";
  var raf = 0;
  var latest = "";

  function host() {
    var el = document.querySelector(".typing-message");
    if (!el) return null;
    return el.querySelector("[class*='bubble'],[class*='content'],[class*='body'],[class*='text']") || el;
  }

  function show(text) {
    var h = host();
    if (!h) return;
    var box = h.querySelector("." + BOX);
    if (!box) {
      box = document.createElement("div");
      box.className = BOX;
      box.style.cssText = "white-space:pre-wrap;word-break:break-word;line-height:1.55";
      Array.prototype.forEach.call(h.children, function (c) {
        c.setAttribute("data-um-hid", c.style.display || "0");
        c.style.display = "none";
      });
      h.appendChild(box);
    }
    box.textContent = text;
    try { box.scrollIntoView({ block: "end" }); } catch (e) {}
  }

  function reset() {
    Array.prototype.forEach.call(document.querySelectorAll("." + BOX), function (b) { b.remove(); });
    Array.prototype.forEach.call(document.querySelectorAll("[data-um-hid]"), function (c) {
      var v = c.getAttribute("data-um-hid");
      c.style.display = v === "0" ? "" : v;
      c.removeAttribute("data-um-hid");
    });
  }

  function paint(text) {
    latest = text;
    if (!raf) raf = requestAnimationFrame(function () { raf = 0; show(latest); });
  }

  window.umairaChatStream = async function (payload) {
    reset();
    var res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
      body: JSON.stringify(payload)
    });

    var type = res.headers.get("content-type") || "";
    if (type.indexOf("text/event-stream") === -1) {
      // Bukan stream (batas tamu, edit gambar, atau header hilang): perilaku lama.
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }
    if (!res.ok || !res.body) throw new Error("HTTP " + res.status);

    var reader = res.body.getReader();
    var dec = new TextDecoder();
    var buf = "";
    var text = "";
    var finalData = null;
    var errMsg = null;

    try {
      for (;;) {
        var r = await reader.read();
        if (r.done) break;
        buf += dec.decode(r.value, { stream: true });
        var idx;
        while ((idx = buf.indexOf("\n\n")) >= 0) {
          var block = buf.slice(0, idx);
          buf = buf.slice(idx + 2);
          var ev = "message";
          var data = "";
          block.split("\n").forEach(function (ln) {
            if (ln.indexOf("event:") === 0) ev = ln.slice(6).trim();
            else if (ln.indexOf("data:") === 0) data += ln.slice(5).trim();
          });
          if (!data) continue;
          var obj;
          try { obj = JSON.parse(data); } catch (e) { continue; }
          if (ev === "delta") { text += obj.t || ""; paint(text); }
          else if (ev === "done") finalData = obj;
          else if (ev === "error") errMsg = obj.error || "Gagal mendapatkan jawaban.";
        }
      }
    } finally {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      reset();
    }

    if (finalData) return finalData;
    if (errMsg) throw new Error(errMsg);
    if (text.trim()) return { message: text.trim(), mode: "gemini" };
    throw new Error("Koneksi terputus sebelum jawaban selesai.");
  };
})();
