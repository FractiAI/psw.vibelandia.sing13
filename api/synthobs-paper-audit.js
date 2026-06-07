/**
 * GET/POST /api/synthobs-paper-audit — NSPFRNP Snap peer-review audit receipts
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const {
      auditWhitepaperById,
      loadAuditReceipt,
      auditConfig,
      SNAP_ID,
    } = await import('../lib/synthobs-peer-review-audit.mjs');
    const { loadSynthobsAgentManifest } = await import('../lib/synthobs-agent-attribution.mjs');

    if (req.method === 'GET') {
      const id = String(req.query?.id || '').trim();
      if (!id) {
        const manifest = await loadSynthobsAgentManifest();
        return res.status(200).json({
          ok: true,
          snapId: SNAP_ID,
          operator: manifest,
          config: auditConfig(),
          usage: { get: '?id=<whitepaperId>', post: '{ "id": "<whitepaperId>" }' },
        });
      }
      const receipt = await loadAuditReceipt(id);
      if (!receipt) {
        return res.status(404).json({ ok: false, code: 'no_receipt', message: 'Run audit first', id });
      }
      return res.status(200).json({ ok: true, receipt });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
      const id = String(body.id || req.query?.id || '').trim();
      if (!id) return res.status(400).json({ ok: false, code: 'id_required' });
      const out = await auditWhitepaperById(id);
      const status = out.receipt?.convergence?.status;
      return res.status(200).json({
        ok: out.ok,
        id,
        convergence: out.receipt?.convergence,
        overallScore: out.receipt?.overallScore,
        receipt: out.receipt,
        passed: status === 'pass' || status === 'soft_pass',
      });
    }

    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ ok: false, message: 'GET or POST only' });
  } catch (err) {
    console.error('[synthobs-paper-audit]', err);
    return res.status(500).json({ ok: false, code: 'audit_error', message: err.message });
  }
};
