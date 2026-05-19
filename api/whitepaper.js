/**
 * GET /api/whitepaper?id=rev-egs-hhf-mythos — server-rendered markdown (no browser CDN marked).
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET only' });
  }

  const id = String(req.query?.id || '').trim();
  if (!id) {
    return res.status(400).json({ ok: false, code: 'id_required' });
  }

  try {
    const { renderWhitepaperById } = await import('../lib/whitepaper-render.mjs');
    const out = await renderWhitepaperById(id);
    if (!out.ok) {
      return res.status(out.code === 'not_found' ? 404 : 500).json(out);
    }
    if (out.redirect) {
      return res.status(200).json({ ok: true, redirect: out.redirect, title: out.title });
    }
    return res.status(200).json(out);
  } catch (err) {
    console.error('[whitepaper]', err);
    return res.status(500).json({
      ok: false,
      code: 'render_error',
      message: err.message || 'Whitepaper render failed',
    });
  }
};
