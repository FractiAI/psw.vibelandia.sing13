import {
  DELTA_X_M,
  HONEYBEE_ANTENNA_LENGTH_M,
  PDB_SPIKE_CIF_URL,
  TARGET_CHROMS,
  UCSC_HS1_CHROM_SIZES_URL,
} from './constants.mjs';

export async function fetchUcscHs1ChromSizes() {
  const res = await fetch(UCSC_HS1_CHROM_SIZES_URL);
  if (!res.ok) throw new Error(`UCSC hs1.chrom.sizes HTTP ${res.status}`);
  const text = await res.text();
  const sizes = {};
  for (const line of text.trim().split('\n')) {
    const [chrom, bp] = line.split(/\s+/);
    if (chrom && bp) sizes[chrom] = Number(bp);
  }
  return {
    source: UCSC_HS1_CHROM_SIZES_URL,
    assembly: 'hs1 (T2T-CHM13v2.0)',
    fetchedAt: new Date().toISOString(),
    sizes,
  };
}

export function stretchedLengthM(bp, deltaX = DELTA_X_M) {
  return bp * deltaX;
}

export function fundamentalFrequencyHz(lengthM, vp) {
  return vp / (2 * lengthM);
}

export async function fetchPdbSpikeSpanNm() {
  const res = await fetch(PDB_SPIKE_CIF_URL);
  if (!res.ok) throw new Error(`PDB CIF HTTP ${res.status}`);
  const text = await res.text();
  const xs = [];
  const ys = [];
  const zs = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('ATOM')) continue;
    const parts = line.trim().split(/\s+/);
    if (parts.length < 13) continue;
    const x = Number(parts[10]);
    const y = Number(parts[11]);
    const z = Number(parts[12]);
    if (Number.isFinite(x)) {
      xs.push(x);
      ys.push(y);
      zs.push(z);
    }
  }
  const span = (arr) => Math.max(...arr) - Math.min(...arr);
  const spanA = { x: span(xs), y: span(ys), z: span(zs) };
  const maxSpanA = Math.max(spanA.x, spanA.y, spanA.z);
  return {
    source: PDB_SPIKE_CIF_URL,
    entry: '6VXX',
    atomCount: xs.length,
    spanA,
    maxSpanNm: maxSpanA / 10,
    maxSpanM: maxSpanA * 1e-10,
    fetchedAt: new Date().toISOString(),
  };
}

export function honeybeeAntennaLength() {
  return {
    source: 'Stange et al. 2011 · Arthropod Struct. Dev.',
    lengthM: HONEYBEE_ANTENNA_LENGTH_M,
    note: 'Literature morphometric baseline; no public collar-style telemetry API for antenna length.',
  };
}

export async function buildGenomicLengthTable(ucsc) {
  const rows = [];
  for (const chrom of TARGET_CHROMS) {
    const bp = ucsc.sizes[chrom];
    if (!bp) continue;
    const lengthM = stretchedLengthM(bp);
    rows.push({
      chrom,
      bp,
      lengthM,
      lengthCm: lengthM * 100,
      lambdaMaxM: 2 * lengthM,
    });
  }
  return rows;
}
