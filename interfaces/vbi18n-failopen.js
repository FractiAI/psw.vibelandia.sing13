/**
 * Fail-open i18n reveal — surfaces stay visible even if i18n-auto.js is blocked,
 * cached stale, or slow. i18n-auto still runs when it loads; this only guarantees paint.
 */
(function () {
  'use strict';

  function injectNeverHideCss() {
    if (document.getElementById('vbi18n-never-hide')) return;
    var st = document.createElement('style');
    st.id = 'vbi18n-never-hide';
    st.textContent =
      'html.vbi18n-pending body,html.vbi18n-ready body{visibility:visible!important}';
    (document.head || document.documentElement).appendChild(st);
  }

  function reveal() {
    var html = document.documentElement;
    if (!html) return;
    html.classList.remove('vbi18n-pending');
    html.classList.add('vbi18n-ready');
  }

  window.__VIBELANDIA_I18N_LIVE_DISABLED__ = true;
  injectNeverHideCss();
  window.__vbi18nFailOpenReveal = reveal;
  reveal();
})();
