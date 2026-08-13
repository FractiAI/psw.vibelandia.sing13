/**
 * POST /api/i18n-translate
 * body: { texts: string[], target: "es"|"fr"|…, source?: "en" }
 * → { ok, translations: string[], target, provider: "mymemory" }
 *
 * Machine translation for live surface / paper i18n. English source remains canonical.
 */
module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ ok: false, message: 'POST only' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, code: 'invalid_json' });
    }
  }
  body = body || {};

  const target = String(body.target || '').trim();
  const source = String(body.source || 'en').trim() || 'en';
  const texts = Array.isArray(body.texts) ? body.texts.map((t) => String(t ?? '')) : null;

  if (!target || target === 'en') {
    return res.status(400).json({ ok: false, code: 'target_required' });
  }
  if (!texts || texts.length === 0) {
    return res.status(400).json({ ok: false, code: 'texts_required' });
  }
  if (texts.length > 80) {
    return res.status(400).json({ ok: false, code: 'too_many_texts', max: 80 });
  }
  const totalChars = texts.reduce((n, t) => n + t.length, 0);
  if (totalChars > 24000) {
    return res.status(400).json({ ok: false, code: 'payload_too_large', maxChars: 24000 });
  }

  try {
    const { translateMany, mymemoryTarget } = await import('../lib/i18n-translate.mjs');
    if (!mymemoryTarget(target)) {
      return res.status(400).json({ ok: false, code: 'unsupported_target', target });
    }
    const translations = await translateMany(texts, target, {
      concurrency: 3,
      source,
    });
    return res.status(200).json({
      ok: true,
      target,
      source,
      provider: 'mymemory',
      translations,
      honesty:
        'Machine-translated surface. English docs remain the canonical source of truth.',
    });
  } catch (err) {
    console.error('[i18n-translate]', err);
    return res.status(500).json({
      ok: false,
      code: 'translate_failed',
      message: err?.message || 'translate_failed',
    });
  }
};
