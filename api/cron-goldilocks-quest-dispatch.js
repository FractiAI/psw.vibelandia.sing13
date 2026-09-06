/**
 * Vercel Cron — Goldilocks Quest Twin daily dispatch.
 * Auth: x-vercel-cron or Authorization: Bearer CRON_SECRET.
 */
export default async function handler(req, res) {
  const cronHeader = req.headers['x-vercel-cron'];
  const auth = req.headers.authorization || '';
  const secret = process.env.CRON_SECRET || process.env.GOLDILOCKS_PULSE_SECRET;
  const authOk = secret && auth === `Bearer ${secret}`;
  const vercelCron = cronHeader === '1' || cronHeader === 'true';

  if (!vercelCron && !authOk) {
    return res.status(401).json({ ok: false, message: 'Cron auth required.' });
  }

  try {
    const { compileDailyDispatch, loadStore, GENERATION } = await import(
      '../lib/goldilocks-quest-twin.mjs'
    );
    const store = loadStore();
    const result = compileDailyDispatch(store);
    return res.status(200).json({
      ok: true,
      cron: true,
      generation: GENERATION,
      ...result,
    });
  } catch (err) {
    console.error('[cron-goldilocks-quest-dispatch]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Goldilocks Quest dispatch cron failed',
    });
  }
}
