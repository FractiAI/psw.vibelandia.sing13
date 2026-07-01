/**
 * POST /api/executive-onboard-tts — neural narration for executive onboarding newscast.
 * Requires OPENAI_API_KEY on the server (voice: onyx — deep male anchor).
 * Client falls back to browser Speech Synthesis when key is absent.
 */

const MAX_CHARS = 4096;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();

  const apiKey = process.env.OPENAI_API_KEY;

  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({
      available: !!apiKey,
      voice: 'onyx',
      model: 'tts-1-hd',
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  if (!apiKey) {
    return res.status(503).json({
      error: 'tts_unavailable',
      message: 'Neural voice not configured. Client will use browser speech.',
    });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'invalid_json' });
    }
  }

  const text = String(body?.text || '').trim();
  if (!text) return res.status(400).json({ error: 'text_required' });
  if (text.length > MAX_CHARS) {
    return res.status(400).json({ error: 'text_too_long', max: MAX_CHARS });
  }

  const voice = ['onyx', 'echo', 'ash'].includes(body?.voice) ? body.voice : 'onyx';

  try {
    const upstream = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1-hd',
        input: text,
        voice,
        response_format: 'mp3',
        speed: 0.95,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return res.status(502).json({
        error: 'upstream_tts_failed',
        status: upstream.status,
        detail: detail.slice(0, 200),
      });
    }

    const buffer = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    return res.status(200).send(buffer);
  } catch (err) {
    return res.status(500).json({
      error: 'tts_error',
      message: err instanceof Error ? err.message : 'unknown',
    });
  }
};
