/**
 * Fail-open i18n reveal — surfaces stay visible even if i18n-auto.js is blocked,
 * cached stale, or slow. i18n-auto still runs when it loads; this only guarantees paint.
 */
(function () {
  'use strict';

  var BACKUP_MS = 500;

  function reveal() {
    var html = document.documentElement;
    if (!html) return;
    html.classList.remove('vbi18n-pending');
    html.classList.add('vbi18n-ready');
  }

  window.__vbi18nFailOpenReveal = reveal;
  reveal();
  window.setTimeout(reveal, BACKUP_MS);

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        var tag = document.querySelector('script[src*="i18n-auto.js"]');
        if (tag) tag.addEventListener('error', reveal);
      },
      { once: true }
    );
  }
})();
