(function () {
  if (document.getElementById("umDocBtn")) return;
  var css = "#umDocBtn{position:fixed;right:16px;bottom:96px;z-index:50;min-height:44px;padding:0 16px;border-radius:12px;border:2px solid #10231C;background:#F2B01E;color:#10231C;font:600 14px system-ui,sans-serif;box-shadow:3px 3px 0 #10231C;cursor:pointer}" +
    "#umDocDlg{border:2px solid #10231C;border-radius:16px;padding:20px;max-width:420px;width:calc(100% - 32px);background:#fff;color:#10231C;font:15px/1.5 system-ui,sans-serif}" +
    "#umDocDlg::backdrop{background:rgba(0,0,0,.5)}#umDocDlg h2{margin:0 0 10px;font-size:20px}" +
    "#umDocDlg fieldset{border:0;padding:0;margin:0 0 10px}#umDocDlg legend{font-weight:600;margin-bottom:4px}" +
    "#umDocDlg label.o{display:flex;align-items:center;gap:8px;min-height:44px}" +
    "#umDocDlg textarea{width:100%;box-sizing:border-box;border:2px solid #10231C;border-radius:10px;padding:10px;font:inherit;color:#10231C;background:#fff}" +
    "#umDocDlg .row{display:flex;gap:8px;justify-content:flex-end;margin-top:12px}" +
    "#umDocDlg .row button{min-height:44px;padding:0 16px;border-radius:10px;border:2px solid #10231C;background:#fff;color:#10231C;font:600 14px system-ui,sans-serif;cursor:pointer}" +
    "#umDocDlg #umDocGo{background:#0F6B4F;color:#fff}#umDocS{min-height:22px;font-size:14px}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  var btn = document.createElement("button"); btn.id = "umDocBtn"; btn.type = "button"; btn.textContent = "Buat file";
  var dlg = document.createElement("dialog"); dlg.id = "umDocDlg"; dlg.setAttribute("aria-labelledby", "umDocH");
  dlg.innerHTML = '<h2 id="umDocH">Buat file dari perintah</h2>' +
    '<fieldset><legend>Jenis file</legend>' +
    '<label class="o"><input type="radio" name="umDocT" value="word" checked> Dokumen Word (.docx)</label>' +
    '<label class="o"><input type="radio" name="umDocT" value="ppt"> Presentasi PowerPoint (.pptx)</label></fieldset>' +
    '<label for="umDocP"><b>Perintah</b></label>' +
    '<textarea id="umDocP" rows="4" maxlength="3000" placeholder="Contoh: Presentasi 6 slide tentang strategi pemasaran toko online"></textarea>' +
    '<div id="umDocS" role="status"></div>' +
    '<div class="row"><button type="button" id="umDocX">Tutup</button><button type="button" id="umDocGo">Buat dan unduh</button></div>';
  document.body.appendChild(btn); document.body.appendChild(dlg);
  var S = dlg.querySelector("#umDocS"), go = dlg.querySelector("#umDocGo");
  btn.onclick = function () { S.textContent = ""; dlg.showModal(); dlg.querySelector("#umDocP").focus(); };
  dlg.querySelector("#umDocX").onclick = function () { dlg.close(); };
  go.onclick = async function () {
    var p = dlg.querySelector("#umDocP").value.trim();
    var t = dlg.querySelector('input[name="umDocT"]:checked').value;
    if (p.length < 5) { S.textContent = "Tulis perintah dulu."; return; }
    go.disabled = true; S.textContent = "Sedang membuat, bisa sampai 1 menit...";
    try {
      var r = await fetch("/api/docgen", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: t, prompt: p }) });
      if (!r.ok) { var j = {}; try { j = await r.json(); } catch (e) {} throw new Error(j.error || "Gagal membuat file."); }
      var m = /filename="([^"]+)"/.exec(r.headers.get("Content-Disposition") || "");
      var a = document.createElement("a"); a.href = URL.createObjectURL(await r.blob());
      a.download = m ? m[1] : (t === "word" ? "dokumen.docx" : "presentasi.pptx");
      document.body.appendChild(a); a.click(); a.remove();
      S.textContent = "Selesai. File sudah terunduh.";
    } catch (e) { S.textContent = e.message; }
    go.disabled = false;
  };
})();
