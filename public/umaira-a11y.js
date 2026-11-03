(function () {
  function fix(root) {
    root
      .querySelectorAll("button:not([aria-label]),[role='button']:not([aria-label]),a:not([aria-label])")
      .forEach(function (el) {
        if ((el.textContent || "").trim()) return;
        var t = el.getAttribute("title") || el.getAttribute("data-tooltip") || el.getAttribute("data-title");
        if (t) el.setAttribute("aria-label", t);
      });
    root.querySelectorAll("input:not([aria-label]),textarea:not([aria-label])").forEach(function (el) {
      if (el.id && document.querySelector('label[for="' + el.id + '"]')) return;
      var p = el.getAttribute("placeholder");
      if (p) el.setAttribute("aria-label", p);
    });
  }
  var timer;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () { fix(document); }, 300);
  }
  function init() {
    fix(document);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
