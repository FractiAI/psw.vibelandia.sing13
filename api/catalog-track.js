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
    deleteTrackMediaBlobs,
    ensureDynamicTrack,
    loadServerCatalog,
    patchDynamicTrack,
    removeDynamicTrack,
    removeTracksPersistently,
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

  if (!trackId && action !== 'delete_many' && action !== 'patch_posters') {
    return res.status(400).json({ error: 'invalid_track_id' });
  }

  if (action === 'delete_many') {
    const rawIds = Array.isArray(body?.trackIds) ? body.trackIds : [];
    const trackIds = rawIds
      .map((id) =>
        String(id || '')
          .replace(/[^\w-]/g, '')
          .slice(0, 80),
      )
      .filter(Boolean);
    if (!trackIds.length) return res.status(400).json({ error: 'invalid_track_ids' });

    const result = await removeTracksPersistently(trackIds, loadServerCatalog, req);
    if (!result.ok) {
      return res.status(result.message === 'catalog_delete_retry_exhausted' ? 503 : 500).json({
        error: 'catalog_save_failed',
        message: result.message || 'Could not save catalog after delete.',
        removed: result.removed,
        missing: result.missing,
      });
    }
    return res.status(200).json({
      ok: true,
      removed: result.removed,
      missing: result.missing,
    });
  }

  if (action === 'patch_posters') {
    const posterSrc = body.posterSrc != null ? String(body.posterSrc).trim().slice(0, 2048) : '';
    if (!posterSrc) return res.status(400).json({ error: 'invalid_poster' });
    const rawIds = Array.isArray(body.trackIds) ? body.trackIds : [];
    const ids = [
      ...new Set(
        rawIds
          .map((id) =>
            String(id || '')
              .replace(/[^\w-]/g, '')
              .slice(0, 80),
          )
          .filter(Boolean),
      ),
    ].slice(0, 500);
    if (!ids.length) return res.status(400).json({ error: 'invalid_track_ids' });

    try {
      let dynamic = await loadServerCatalog(req);
      if (!dynamic) return res.status(500).json({ error: 'catalog_save_failed' });
      let patched = 0;
      for (const id of ids) {
        if (!dynamic.tracks?.[id]) continue;
        const next = patchDynamicTrack(dynamic, id, { posterSrc });
        if (next) {
          dynamic = next;
          patched += 1;
        }
      }
      const saved = await saveDynamicCatalog(dynamic);
      if (!saved.ok) {
        return res.status(500).json({ error: 'catalog_save_failed', message: saved.message });
      }
      return res.status(200).json({ ok: true, patched, catalog: dynamic });
    } catch (e) {
      console.error('[catalog-track] patch_posters', e);
      return res.status(500).json({ error: 'catalog_save_failed', message: e?.message });
    }
  }

  const dynamic = await ensureDynamicTrack(req, trackId);
  if (!dynamic?.tracks?.[trackId]) {
    return res.status(404).json({ error: 'track_not_found' });
  }

  if (action === 'delete') {
    const result = await removeTracksPersistently([trackId], loadServerCatalog, req);
    if (!result.ok) {
      return res.status(result.message === 'catalog_delete_retry_exhausted' ? 503 : 500).json({
        error: 'catalog_save_failed',
        message: result.message || 'Could not save catalog after delete.',
      });
    }
    if (!result.removed.length) {
      return res.status(404).json({ error: 'track_not_found', missing: result.missing });
    }
    return res.status(200).json({ ok: true, trackId, removed: result.removed });
  }

  if (action === 'update') {
    const patchFields = {
      title: body.title,
      artist: body.artist,
      genre: body.genre,
      description: body.description,
      durationSec: body.durationSec,
      src: body.src,
      posterSrc: body.posterSrc,
      metaUpdatedAt: body.metaUpdatedAt,
      clearVideo: body.clearVideo === true || body.clearVideo === 'true',
    };

    // Reload + patch + save with retries so concurrent writers cannot clobber titles.
    let next = null;
    let savedTrack = null;
    let lastError = null;
    for (let attempt = 0; attempt < 4; attempt++) {
      const fresh = await ensureDynamicTrack(req, trackId);
      if (!fresh?.tracks?.[trackId]) {
        return res.status(404).json({ error: 'track_not_found' });
      }
      next = patchDynamicTrack(fresh, trackId, patchFields);
      if (!next) return res.status(404).json({ error: 'track_not_found' });

      if (Array.isArray(body.playlistIds)) {
        next = setDynamicTrackPlaylistMembership(next, trackId, body.playlistIds);
      }

      try {
        const saved = await saveDynamicCatalog(next);
        if (!saved.ok) {
          lastError = saved.message || 'catalog_save_failed';
          await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
          continue;
        }
        savedTrack = next.tracks[trackId];

        const checkTitle = body.title !== undefined;
        const checkArtist = body.artist !== undefined;
        const checkPoster = body.posterSrc !== undefined;
        const reloaded = await ensureDynamicTrack(req, trackId);
        const got = reloaded?.tracks?.[trackId];
        const titleOk = !checkTitle || (got && got.title === savedTrack.title);
        const artistOk = !checkArtist || (got && got.artist === savedTrack.artist);
        const posterOk =
          !checkPoster ||
          (got &&
            (body.posterSrc
              ? got.posterSrc === savedTrack.posterSrc
              : !got.posterSrc));
        if (titleOk && artistOk && posterOk) {
          return res.status(200).json({
            track: got || savedTrack,
            catalog: reloaded || next,
          });
        }
        // Stale concurrent write won — retry with a fresh load.
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      } catch (e) {
        lastError = e?.message || 'catalog_save_failed';
        console.error('[catalog-track] update save', e);
        await new Promise((r) => setTimeout(r, 200 * (attempt + 1)));
      }
    }

    if (savedTrack) {
      console.warn('[catalog-track] verify soft-fail after retries', trackId);
      return res.status(200).json({ track: savedTrack, catalog: next, verifySoftFail: true });
    }
    return res.status(500).json({
      error: 'catalog_save_failed',
      message: lastError || 'Could not persist track update.',
    });
  }

  return res.status(400).json({ error: 'invalid_action' });
};
