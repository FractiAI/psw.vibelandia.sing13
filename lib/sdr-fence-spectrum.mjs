/**
 * Passive fence coupling from real SDR downstream samples (OpenWebRX IQ / FFT / demod buffer).
 * Maps contiguous RMS chunks along the received Float32 vector to per-gate weights — not
 * independent physical gate probes; spectral / time-slice energy along the RX passband.
 */

/** Split a float series into `chunkCount` contiguous segments; RMS per segment. */
export function floatSeriesChunkRms(samples, chunkCount) {
  if (!samples || samples.length < chunkCount * 2 || chunkCount < 2) return null;
  const n = samples.length;
  const out = new Array(chunkCount);
  for (let c = 0; c < chunkCount; c++) {
    const a = Math.floor((c * n) / chunkCount);
    const b = Math.floor(((c + 1) * n) / chunkCount);
    let sum = 0;
    let cnt = 0;
    for (let i = a; i < b; i++) {
      const v = samples[i];
      if (Number.isFinite(v)) {
        sum += v * v;
        cnt++;
      }
    }
    out[c] = cnt > 0 ? Math.sqrt(sum / cnt) : 0;
  }
  return out;
}

/** Linear interpolate spectrum bins → one coupling scalar per fence gate (ordered along perimeter). */
export function mapSpectrumToGateCoupling(chunkRmss, gateCount) {
  if (!chunkRmss?.length || gateCount < 1) return null;
  const m = chunkRmss.length;
  if (m === 1) return Array.from({ length: gateCount }, () => chunkRmss[0]);
  const out = [];
  for (let i = 0; i < gateCount; i++) {
    const t = gateCount > 1 ? i / (gateCount - 1) : 0.5;
    const pos = t * (m - 1);
    const i0 = Math.floor(pos);
    const i1 = Math.min(m - 1, i0 + 1);
    const frac = pos - i0;
    out.push(chunkRmss[i0] * (1 - frac) + chunkRmss[i1] * frac);
  }
  return out;
}

/** Normalize to [floor, 1] so every gate stays excitable but relative shape is preserved. */
export function normalizeCouplingShape(values, floor = 0.35) {
  if (!values?.length) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (!Number.isFinite(v)) continue;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
  if (max <= min) return values.map(() => 1);
  return values.map((v) => floor + (1 - floor) * ((v - min) / (max - min)));
}

/**
 * Derive RMS chunks from a raw OpenWebRX `iqBase64` Float32LE payload (FFT bins, IQ pairs, or demod floats).
 */
export function spectrumChunksFromIqBase64(iqBase64, chunkTarget = 32) {
  if (!iqBase64 || typeof iqBase64 !== 'string') return null;
  const buf = Buffer.from(iqBase64, 'base64');
  if (buf.byteLength < 64) return null;
  const floatCount = Math.floor(buf.byteLength / 4);
  const view = new Float32Array(buf.buffer, buf.byteOffset, floatCount);
  const chunks = Math.min(64, Math.max(8, chunkTarget || Math.floor(floatCount / 48)));
  return floatSeriesChunkRms(view, chunks);
}
