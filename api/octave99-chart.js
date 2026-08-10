/**
 * POST /api/octave99-chart — generate a 99 Octave chart from intake.
 * Free preview always allowed; deluxe flag is client-attested (honor rail).
 */
import { buildOctave99Chart, chartSvg } from '../lib/octave99-chart.mjs';
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
      product: '99 Octave Chart',
      tiers: OCTAVE99_TIERS,
      honesty:
        'Architectural Omni-Lattice chart — not predictive astrology or medical advice.',
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
  const chart = buildOctave99Chart(intake);
  const svg = chartSvg(chart, { deluxe });
  return json(res, 200, {
    chart,
    svg,
    tierHint: deluxe ? OCTAVE99_TIERS.chart_deluxe : OCTAVE99_TIERS.chart_standard,
  });
}
