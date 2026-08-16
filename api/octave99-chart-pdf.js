/**
 * POST /api/octave99-chart-pdf — downloadable hybrid natal × 99 Octave PDF.
 * Free = 1 page · Standard = 10 pages · Deluxe = 30 pages.
 */
import { buildOctave99Chart, buildChartReading } from '../lib/octave99-chart.mjs';
import { buildChartPdfBytes, pdfPageCountForTier } from '../lib/octave99-chart-pdf.mjs';

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
      product: 'Your 99 Octave Chart · PDF deliverable',
      pages: { free: 1, chart_standard: 10, chart_deluxe: 30 },
      honesty:
        'Hybrid natal × 99 Octave downloadable PDF — architectural Story map for purpose, flow, and life architecture. Not predictive astrology or medical advice.',
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
  const tier = body.tier || (deluxe ? 'chart_deluxe' : 'free');
  const chart = buildOctave99Chart(intake);
  const reading = buildChartReading(chart, {
    tier,
    focus: body.focus,
    season: body.season,
    question: body.question,
    lens: body.lens,
  });

  try {
    const pdf = await buildChartPdfBytes(chart, {
      tier,
      reading,
      focus: body.focus,
      season: body.season,
      question: body.question,
      lens: body.lens,
    });
    const buf = Buffer.from(pdf.bytes);
    res.statusCode = 200;
    res.setHeader('content-type', 'application/pdf');
    res.setHeader('content-disposition', `attachment; filename="${pdf.filename}"`);
    res.setHeader('cache-control', 'no-store');
    res.setHeader('x-octave99-pdf-pages', String(pdfPageCountForTier(tier)));
    res.end(buf);
  } catch (err) {
    console.error('octave99-chart-pdf', err);
    return json(res, 500, { error: 'PDF generation failed' });
  }
}
