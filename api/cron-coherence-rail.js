/**
 * Vercel Cron — runs coherence autopilot (payout rail + Goldilocks pulse).
 * Auth: x-vercel-cron header (automatic) or Authorization: Bearer CRON_SECRET.
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
    const { runCoherenceAutopilotCycle } = await import('../lib/coherence-autopilot.mjs');
    const out = await runCoherenceAutopilotCycle({ forcePulse: req.query?.force === '1' });
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({
      ok: true,
      cron: true,
      humanInterventionRequired: false,
      emitted: out.pulse.emitted,
      latestPulseId: out.pulse.latest?.pulseId || null,
      payoutRail: out.rail.payoutRail,
      autopilot: out.rail.autopilot,
    });
  } catch (err) {
    console.error('[cron-coherence-rail]', err);
    return res.status(500).json({
      ok: false,
      message: err.message || 'Autopilot cycle failed',
    });
  }
};
