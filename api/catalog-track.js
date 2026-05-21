/**
 * POST /api/catalog-track — update or delete server-hosted tracks in the dynamic catalog.
 * Body: { action: 'update' | 'delete', trackId, title?, artist?, genre?, description?, durationSec?, playlistIds? }
 */
const { loadCatalogServer } = require('../lib/catalog-api-lib.cjs');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, X-Catalog-Secret, X-Catalog-Upload-Secret',
  );
}

function readBody(req) {
  if (typeof req.body === 'object' && req.body && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  let catalog;
  try {
    catalog = await loadCatalogServer();
  } catch (e) {
    console.error('[catalog-track] load module', e);
    return res.status(500).json({ error: 'catalog_module_failed', message: e?.message });
  }

  const {
    assertCatalogUploadAuth,
    catalogUploadConfigured,
    ensureDynamicTrack,
    patchDynamicTrack,
    removeDynamicTrack,
    saveDynamicCatalog,
    setDynamicTrackPlaylistMembership,
  } = catalog;

  if (!catalogUploadConfigured()) {
    return res.status(503).json({
      error: 'catalog_upload_unconfigured',
      message: 'Set BLOB_READ_WRITE_TOKEN and CATALOG_UPLOAD_SECRET on Vercel.',
    });
  }

  const auth = assertCatalogUploadAuth(req);
  if (!auth.ok) return res.status(auth.status).json({ error: auth.code });

  const body = readBody(req);
  const action = body?.action;
  const trackId = String(body?.trackId || '')
    .replace(/[^\w-]/g, '')
    .slice(0, 80);

  if (!trackId) return res.status(400).json({ error: 'invalid_track_id' });

  const dynamic = await ensureDynamicTrack(req, trackId);
  if (!dynamic?.tracks?.[trackId]) {
    return res.status(404).json({ error: 'track_not_found' });
  }

  if (action === 'delete') {
    const next = removeDynamicTrack(dynamic, trackId);
    if (!next) return res.status(404).json({ error: 'track_not_found' });
    try {
      const saved = await saveDynamicCatalog(next);
      if (!saved.ok) {
        return res.status(500).json({ error: 'catalog_save_failed', message: saved.message });
      }
    } catch (e) {
      console.error('[catalog-track] delete save', e);
      return res.status(500).json({ error: 'catalog_save_failed', message: e?.message });
    }
    return res.status(200).json({ ok: true, trackId });
  }

  if (action === 'update') {
    let next = patchDynamicTrack(dynamic, trackId, {
      title: body.title,
      artist: body.artist,
      genre: body.genre,
      description: body.description,
      durationSec: body.durationSec,
      src: body.src,
      posterSrc: body.posterSrc,
      clearVideo: body.clearVideo === true || body.clearVideo === 'true',
    });
    if (!next) return res.status(404).json({ error: 'track_not_found' });

    if (Array.isArray(body.playlistIds)) {
      next = setDynamicTrackPlaylistMembership(next, trackId, body.playlistIds);
    }

    try {
      const saved = await saveDynamicCatalog(next);
      if (!saved.ok) {
        return res.status(500).json({ error: 'catalog_save_failed', message: saved.message });
      }

      const savedTrack = next.tracks[trackId];
      const checkTitle = body.title !== undefined;
      const checkArtist = body.artist !== undefined;
      const checkSrc = body.src !== undefined;
      const checkClearVideo = body.clearVideo === true || body.clearVideo === 'true';

      let verified = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        const reloaded = await ensureDynamicTrack(req, trackId);
        const got = reloaded?.tracks?.[trackId];
        if (!got) {
          await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
          continue;
        }
        const titleOk = !checkTitle || got.title === savedTrack.title;
        const artistOk = !checkArtist || got.artist === savedTrack.artist;
        const srcOk = !checkSrc || got.src === savedTrack.src;
        const videoOk = !checkClearVideo || !got.videoSrc;
        if (titleOk && artistOk && srcOk && videoOk) {
          verified = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
      if (!verified) {
        console.warn('[catalog-track] verify soft-fail (still returning saved track)', trackId);
      }
    } catch (e) {
      console.error('[catalog-track] update save', e);
      return res.status(500).json({ error: 'catalog_save_failed', message: e?.message });
    }

    const fresh = await ensureDynamicTrack(req, trackId);
    const track = fresh?.tracks?.[trackId] ?? next.tracks[trackId];
    return res.status(200).json({ track, catalog: fresh ?? next });
  }

  return res.status(400).json({ error: 'invalid_action' });
};
