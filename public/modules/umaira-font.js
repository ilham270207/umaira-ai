/*
 * umaira-font.js
 * Menerapkan font serif ke seluruh antarmuka dengan prioritas tinggi, agar tidak
 * tertimpa stylesheet lain. Ganti FAMILY di bawah untuk memakai font berbeda.
 */
(function () {
  'use strict';
  if (window.__uvFont) return;
  window.__uvFont = true;

  var FAMILY = '"Source Serif 4", "Times New Roman", Times, Georgia, "Noto Serif", serif';
  var MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Roboto Mono", "Droid Sans Mono", monospace';
  var R = ':root:root:root:root';

  var css =
    R + ' body, ' + R + ' body *, ' + R + ' input, ' + R + ' button, ' + R + ' select, ' + R + ' textarea {font-family:' + FAMILY + ' !important}\n' +
    R + ' pre, ' + R + ' pre *, ' + R + ' code, ' + R + ' kbd, ' + R + ' samp {font-family:' + MONO + ' !important}';

  try {
    var sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
    document.adoptedStyleSheets = document.adoptedStyleSheets.concat([sheet]);
  } catch (e) {
    var st = document.createElement('style');
    st.id = 'uv-font-style';
    st.textContent = css;
    document.head.appendChild(st);
  }

  if (!document.getElementById('uv-font-link')) {
    var l = document.createElement('link');
    l.id = 'uv-font-link';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,400&display=swap';
    document.head.appendChild(l);
  }
})();
