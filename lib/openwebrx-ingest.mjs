/**
 * Server-side OpenWebRX WebSocket ingest — real receive-only RF frames (no browser CORS).
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import WebSocket from 'ws';
import { decodeOpenWebRxBinary } from './iq-decode.mjs';
import { redisGetJson, redisSetJson, upstashConfigured } from './upstash.mjs';

export const HYDROGEN_TUNE_HZ = 1420400000;
export const WEBSDR_REDIS_KEY = 'qv:goldilocks:websdr:latest:v1';
export const WEBSDR_MAX_AGE_MS = 15 * 60 * 1000;

/** Public receive-only OpenWebRX endpoints (ordered). */
export const OPENWEBRX_ENDPOINTS = [
  { url: 'wss://openwebrx.rahsmann.de/ws/', label: 'rahsmann.de' },
  { url: 'wss://rx.rxw.cz/ws/', label: 'rx.rxw.cz' },
  { url: 'wss://openwebrx.db0fhr.de/ws/', label: 'db0fhr.de' },
  { url: 'wss://websdr.frogden.org:8443/ws/', label: 'frogden.org' },
];

const memCache = globalThis.__qvWebSdrCache || (globalThis.__qvWebSdrCache = { latest: null });

function clampOffset(offset, bandwidth) {
  const half = Math.max(1000, (bandwidth || 2_400_000) / 2 - 500);
  return Math.max(-half, Math.min(half, offset));
}

/**
 * Capture one live OpenWebRX binary frame (audio or FFT).
 * @returns {Promise<object>}
 */
export async function captureOpenWebRxFrame({
  endpoints = OPENWEBRX_ENDPOINTS,
  tuneHz = HYDROGEN_TUNE_HZ,
  timeoutMs = 22000,
  outputRate = 12000,
} = {}) {
  const list = Array.isArray(endpoints) ? endpoints : OPENWEBRX_ENDPOINTS;
  let lastErr = null;
  for (const ep of list) {
    try {
      return await captureOpenWebRxFromUrl(ep.url, ep.label, { tuneHz, timeoutMs, outputRate });
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('All OpenWebRX endpoints failed');
}

function captureOpenWebRxFromUrl(url, label, { tuneHz, timeoutMs, outputRate }) {
  return new Promise((resolve, reject) => {
    const t0 = Date.now();
    let settled = false;
    let centerFreq = null;
    let bandwidth = 2_400_000;
    let demodStarted = false;
    let bestFrame = null;

    const timer = setTimeout(() => {
      if (bestFrame) finish(null, bestFrame);
      else finish(new Error('timeout_no_frame'));
    }, timeoutMs);

    function finish(err, result) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (handshakeIv) clearInterval(handshakeIv);
      try {
        ws.close();
      } catch (_) {}
      if (err) reject(err);
      else resolve(result);
    }

    let handshakeIv = null;
    const ws = new WebSocket(url, { handshakeTimeout: 10000 });

    function sendClientHello() {
      try {
        ws.send('SERVER DE CLIENT client=GoldilocksOS/13D type=receiver');
        ws.send(
          JSON.stringify({
            type: 'connectionproperties',
            params: { output_rate: outputRate, hd_output_rate: 36000 },
          }),
        );
      } catch (e) {
        finish(e);
      }
    }

    function startDemod() {
      if (demodStarted || centerFreq == null) return;
      demodStarted = true;
      const offset = clampOffset(tuneHz - centerFreq, bandwidth);
      try {
        ws.send(JSON.stringify({ type: 'dspcontrol', action: 'start' }));
        ws.send(
          JSON.stringify({
            type: 'dspcontrol',
            params: {
              mod: 'usb',
              offset_freq: offset,
              low_cut: -1500,
              high_cut: 1500,
              squelch_level: -150,
            },
          }),
        );
      } catch (e) {
        finish(e);
      }
    }

    ws.on('open', () => {
      sendClientHello();
      handshakeIv = setInterval(() => {
        if (!demodStarted && centerFreq != null) startDemod();
      }, 2000);
    });

    ws.on('message', (data, isBinary) => {
      if (settled) return;

      if (!isBinary && typeof data === 'string') {
        if (data.startsWith('CLIENT DE SERVER')) return;
        try {
          const json = JSON.parse(data);
          if (json.type === 'config' && json.value) {
            if (typeof json.value.center_freq === 'number') centerFreq = json.value.center_freq;
            if (typeof json.value.samp_rate === 'number') bandwidth = json.value.samp_rate;
            startDemod();
          }
          if (json.type === 'error' || json.type === 'sdr_error') {
            finish(new Error(json.value || json.type));
          }
        } catch (_) {}
        return;
      }

      const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
      const decoded = decodeOpenWebRxBinary(buf);
      if (!decoded || !decoded.samples) return;

      const samples = decoded.samples;
      const maxSamples = 8192;
      const slice =
        samples.length > maxSamples ? samples.subarray(0, maxSamples) : samples;
      const iqBase64 = Buffer.from(slice.buffer, slice.byteOffset, slice.byteLength).toString(
        'base64',
      );

      const payload = {
        ok: true,
        source: 'openwebrx',
        endpoint: url,
        endpointLabel: label,
        frameType: decoded.type,
        capturedAt: new Date().toISOString(),
        captureMs: Date.now() - t0,
        tuneTargetHz: tuneHz,
        centerFreqHz: centerFreq,
        bandwidthHz: bandwidth,
        offsetHz: centerFreq != null ? clampOffset(tuneHz - centerFreq, bandwidth) : null,
        sampleCount: slice.length,
        byteLength: buf.byteLength,
        iqBase64,
        encoding: 'float32-le',
        note:
          decoded.type === 'audio' || decoded.type === 'hd_audio'
            ? 'Live OpenWebRX demodulated RF audio (Int16) — same φ ingest path as IQ.'
            : 'Live OpenWebRX FFT spectrum slice — φ ingest path.',
      };

      if (decoded.type === 'audio' || decoded.type === 'hd_audio') {
        finish(null, payload);
        return;
      }
      if (!bestFrame) bestFrame = payload;
    });

    ws.on('error', (e) => finish(e));
    ws.on('close', () => {
      if (!settled) finish(new Error('socket_closed_before_frame'));
    });
  });
}

export async function loadCachedWebSdrFrame() {
  if (upstashConfigured()) {
    const row = await redisGetJson(WEBSDR_REDIS_KEY);
    if (row?.iqBase64) return row;
  }
  return memCache.latest;
}

export async function storeWebSdrFrame(frame) {
  memCache.latest = frame;
  if (upstashConfigured()) {
    await redisSetJson(WEBSDR_REDIS_KEY, frame, 3600);
  }
  return frame;
}

export function frameAgeMs(frame) {
  if (!frame?.capturedAt) return Infinity;
  return Date.now() - new Date(frame.capturedAt).getTime();
}

async function loadBundledFallbackFrame() {
  try {
    const raw = await readFile(join(process.cwd(), 'data/websdr-latest.json'), 'utf8');
    const frame = JSON.parse(raw);
    if (frame?.iqBase64) return { ...frame, bundled: true };
  } catch (_) {}
  return null;
}

export async function getWebSdrFrame({ live = false, maxAgeMs = WEBSDR_MAX_AGE_MS } = {}) {
  const cached = await loadCachedWebSdrFrame();
  const stale = !cached || frameAgeMs(cached) > maxAgeMs;

  if (live || stale) {
    try {
      const fresh = await captureOpenWebRxFrame();
      await storeWebSdrFrame(fresh);
      return { frame: fresh, live: true, stale: false };
    } catch (err) {
      if (cached) return { frame: cached, live: false, stale: true, captureError: err.message };
      const bundled = await loadBundledFallbackFrame();
      if (bundled) return { frame: bundled, live: false, stale: true, captureError: err.message };
      throw err;
    }
  }

  return { frame: cached, live: false, stale: false };
}
