/**
 * GET /api/deploy-info — which Vercel team/project is running and which Blob store backs the catalog.
 * Use after deploy to confirm production is FractiAI / psw-vibelandia-sing13 (not FractiVerse hobby).
 */
const { loadCatalogServer } = require('../lib/catalog-api-lib.cjs');

function blobHostFromUrl(url) {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const onVercel = !!(process.env.VERCEL || process.env.VERCEL_ENV);
  const blobTokenConfigured = !!process.env.BLOB_READ_WRITE_TOKEN;

  let catalogUploadConfigured = false;
  let blobSampleHost = null;
  let catalogTrackCount = 0;
  let catalogVersion = null;

  try {
    const lib = await loadCatalogServer();
    catalogUploadConfigured = lib.catalogUploadConfigured();

    if (blobTokenConfigured) {
      try {
        const { list } = await import('@vercel/blob');
        const { blobs } = await list({ prefix: 'catalog/', limit: 5 });
        const withUrl = blobs.find((b) => b.url);
        blobSampleHost = blobHostFromUrl(withUrl?.url);
      } catch (e) {
        blobSampleHost = `list_failed:${e?.message || 'unknown'}`;
      }
    }

    try {
      const { loadServerCatalog } = lib;
      const catalog = await loadServerCatalog(req);
      catalogTrackCount = Object.keys(catalog.tracks || {}).length;
      catalogVersion = catalog.version ?? null;
      if (!blobSampleHost) {
        const first = Object.values(catalog.tracks || {}).find((t) => t?.src);
        blobSampleHost = blobHostFromUrl(first?.src) || blobHostFromUrl(first?.posterSrc);
      }
    } catch {
      /* catalog optional for this probe */
    }
  } catch (e) {
    return res.status(500).json({ error: 'deploy_info_failed', message: e?.message });
  }

  const gitOwner = process.env.VERCEL_GIT_REPO_OWNER || null;
  const gitRepo = process.env.VERCEL_GIT_REPO_SLUG || null;
  const matchesExpectedRepo =
    gitOwner?.toLowerCase() === 'fractiai' && gitRepo === 'psw.vibelandia.sing13';

  return res.status(200).json({
    ok: true,
    checkedAt: new Date().toISOString(),
    vercel: {
      onVercel,
      env: process.env.VERCEL_ENV || null,
      url: process.env.VERCEL_URL || null,
      productionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL || null,
      teamId: process.env.VERCEL_TEAM_ID || null,
      projectId: process.env.VERCEL_PROJECT_ID || null,
      gitOwner,
      gitRepo,
      matchesExpectedRepo,
    },
    expected: {
      teamSlug: 'fractiai',
      projectName: 'psw-vibelandia-sing13',
      productionHost: 'www.ssvibelandiaquestfest24x365.com',
      dashboard: 'https://vercel.com/fractiai/psw-vibelandia-sing13',
    },
    catalog: {
      blobTokenConfigured,
      catalogUploadConfigured,
      blobSampleHost,
      catalogTrackCount,
      catalogVersion,
    },
    billingNote:
      'Vercel Blob quota is billed to the team that OWNS the Blob store (blob host prefix), not necessarily the Pro project. A FractiVerse hobby email means a store on that team is full — check Storage on both teams.',
  });
};
