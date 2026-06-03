/** Inject shared catalog synthesis primer into #catalog-primer-mount */
(function () {
  'use strict';
  const mount = document.getElementById('catalog-primer-mount');
  if (!mount) return;
  fetch('/interfaces/partials/catalog-synthesis-primer.html')
    .then((r) => r.text())
    .then((html) => {
      mount.innerHTML = html;
    })
    .catch(() => {
      mount.innerHTML =
        '<p class="deck-lead">Catalog primer could not load. <a href="/interfaces/whitepaper-catalog.html">Open the paper catalog</a>.</p>';
    });
})();
