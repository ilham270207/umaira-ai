(function () {
  var RE = /\u27e6umairafile:([\w-]{4,64})\u27e7/g, done = false;
  var NAMES = { docx: "Dokumen Word", pdf: "PDF", pptx: "Presentasi PowerPoint" };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function css() {
    if (!document.head || document.getElementById("umfCss")) return;
    var s = document.createElement("style"); s.id = "umfCss";
    s.textContent = ".umf-card{display:flex;align-items:center;gap:12px;margin:8px 0;padding:10px 12px;border:1px solid rgba(120,120,160,.4);border-radius:14px;background:rgba(255,255,255,.55);max-width:420px}" +
      ".umf-ic{flex:none;min-width:48px;text-align:center;padding:8px 6px;border-radius:10px;background:#5B4BDB;color:#fff;font:700 12px system-ui,sans-serif}" +
      ".umf-ic.pdf{background:#D93025}.umf-ic.pptx{background:#D9622B}" +
      ".umf-t{flex:1;min-width:0}.umf-t b{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.umf-t small{opacity:.75}" +
      ".umf-dl{flex:none;min-height:44px;display:inline-flex;align-items:center;padding:0 16px;border-radius:10px;background:#5B4BDB;color:#fff;font-weight:600;text-decoration:none}";
    document.head.appendChild(s);
  }
  function install() {
    if (done || typeof renderChatMarkdown !== "function") return;
    done = true; css();
    var orig = renderChatMarkdown;
    window.renderChatMarkdown = function () {
      var html = orig.apply(this, arguments);
      if (typeof html !== "string" || html.indexOf("\u27e6umairafile:") === -1) return html;
      return html.replace(RE, function (m, id) {
        var ext = id.split("-").pop(), slug = id.replace(/-[a-f0-9]{12}-[a-z]+$/, "").replace(/^[a-f0-9]{12}-[a-z]+$/, "");
        var name = (slug || "dokumen") + "." + ext;
        return '<span class="umf-card"><span class="umf-ic ' + esc(ext) + '">' + esc(ext.toUpperCase()) + '</span>' +
          '<span class="umf-t"><b>' + esc(name) + '</b><small>' + esc(NAMES[ext] || "File") + '</small></span>' +
          '<a class="umf-dl" href="/api/chat-files/' + esc(id) + '" download="' + esc(name) + '">Unduh</a></span>';
      });
    };
  }
  install();
  if (!done) { document.addEventListener("DOMContentLoaded", install); window.addEventListener("load", install); }
})();
