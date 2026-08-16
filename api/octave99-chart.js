/**
 * POST /api/octave99-chart — generate a 99 Octave chart from intake.
 * Free preview always allowed; deluxe flag is client-attested (honor rail).
 */
import { buildOctave99Chart, chartSvg, buildChartReading } from '../lib/octave99-chart.mjs';
import { OCTAVE99_TIERS } from '../lib/octave99-tiers.mjs';

export const config = { maxDuration: 30 };

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  return JSON.parse(raw);
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method === 'GET') {
    return json(res, 200, {
      product: 'Your 99 Octave Chart',
      tiers: OCTAVE99_TIERS,
      honesty:
        'Get Your 99 Octave Chart — chart yourself within the grand Story to 99 octaves of depth (Φ_EGS) using fractal · holographic · Goldilocks AI. Architectural Omni-Lattice map — not predictive astrology or medical advice.',
    });
  }
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }
  let body;
  try {
    body = await readBody(req);
  } catch {
    return json(res, 400, { error: 'Invalid JSON' });
  }
  const intake = {
    name: body.name,
    birthDate: body.birthDate,
    birthTime: body.birthTime,
    birthPlace: body.birthPlace,
    lat: body.lat != null ? Number(body.lat) : undefined,
    lon: body.lon != null ? Number(body.lon) : undefined,
  };
  if (!intake.name || !intake.birthDate) {
    return json(res, 400, { error: 'name and birthDate are required' });
  }
  const deluxe = Boolean(body.deluxe);
  const tier = body.tier || (deluxe ? 'chart_deluxe' : 'chart_standard');
  const chart = buildOctave99Chart(intake);
  const svg = chartSvg(chart, { deluxe, tier });
  const reading = buildChartReading(chart, {
    tier,
    focus: body.focus,
    season: body.season,
    question: body.question,
    lens: body.lens,
  });
  return json(res, 200, {
    chart,
    svg,
    reading,
    tierHint:
      tier === 'chart_deluxe' || deluxe
        ? OCTAVE99_TIERS.chart_deluxe
        : tier === 'free'
          ? OCTAVE99_TIERS.free
          : OCTAVE99_TIERS.chart_standard,
  });
}
