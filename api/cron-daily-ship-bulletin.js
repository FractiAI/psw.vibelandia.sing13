/**
 * Vercel Cron — warm / refresh daily ship bulletin (deterministic steward).
 * Auth: x-vercel-cron or Authorization: Bearer CRON_SECRET.
 * Does not commit HTML; guests load live copy via GET /api/daily-ship-bulletin.
 */
module.exports = async function handler(req, res) {
  const cronHeader = req.headers['x-vercel-cron'];
  const auth = req.headers.authorization || '';
  const secret = process.env.CRON_SECRET || process.env.GOLDILOCKS_PULSE_SECRET;
  const authOk = secret && auth === `Bearer ${secret}`;
  const vercelCron = cronHeader === '1' || cronHeader === 'true';

  if (!vercelCron && !authOk) {
    return res.status(401).json({ ok: false, message: 'Cron auth required.' });
  }

  try {
    const { buildDailyShipBulletin, todayYmd } = await import('../lib/daily-ship-bulletin.mjs');
    const payload = await buildDailyShipBulletin({ date: todayYmd() });

    // Optional Blob cache when token present (lite edge — center = pipes).
    let blobUrl = null;
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import('@vercel/blob');
        const body = JSON.stringify(payload, null, 2);
        const blob = await put(`ship-bulletin/daily-${payload.date}.json`, body, {
          access: 'public',
          contentType: 'application/json',
          addRandomSuffix: false,
          allowOverwrite: true,
        });
        blobUrl = blob.url;
      } catch (blobErr) {
        console.warn('[cron-daily-ship-bulletin] blob skip:', blobErr.message);
      }
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      ok: true,
      cron: true,
      humanInterventionRequired: false,
      date: payload.date,
      newsLabel: payload.newsLabel,
      highlightIds: (payload.highlights || []).map((h) => h.id),
      blobUrl,
      operator: payload.operator,
    });
  } catch (err) {
    console.error('[cron-daily-ship-bulletin]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Daily bulletin cron failed',
    });
  }
};
