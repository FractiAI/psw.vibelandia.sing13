/**
 * Lazy-load ESM doodles-gallery + catalog-server for Vercel CJS api/doodles.js.
 */
let doodlesCached;
let catalogCached;

async function loadDoodlesGallery() {
  if (!doodlesCached) doodlesCached = await import('./doodles-gallery.mjs');
  return doodlesCached;
}

async function loadCatalogServer() {
  if (!catalogCached) catalogCached = await import('./catalog-server.mjs');
  return catalogCached;
}

module.exports = { loadDoodlesGallery, loadCatalogServer };
