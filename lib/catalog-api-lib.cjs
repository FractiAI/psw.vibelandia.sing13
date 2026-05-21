/**
 * Lazy-load ESM catalog-server for Vercel CJS api/*.js handlers.
 * Top-level require() of .mjs causes FUNCTION_INVOCATION_FAILED on the edge runtime.
 */
let cached;

async function loadCatalogServer() {
  if (!cached) cached = await import('./catalog-server.mjs');
  return cached;
}

module.exports = { loadCatalogServer };
