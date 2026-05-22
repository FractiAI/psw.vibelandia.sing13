/**
 * Probe public OpenWebRX WebSocket endpoints for first binary frame.
 * node scripts/probe-websdr-endpoints.mjs
 */
import WebSocket from 'ws';

const HYDROGEN_HZ = 1420400000;
const ENDPOINTS = [
  'wss://websdr.frogden.org:8443/ws/',
  'wss://ivopenwebrx.ddns.net:8073/ws/',
  'wss://openwebrx.rahsmann.de/ws/',
  'wss://rx.rxw.cz/ws/',
  'wss://openwebrx.db0fhr.de/ws/',
];

function probe(url) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    let frames = 0;
    let bytes = 0;
    let jsonRx = 0;
    let handshake = 0;
    const timer = setTimeout(() => {
      try {
        ws.close();
      } catch (_) {}
      resolve({
        url,
        ok: frames > 0,
        frames,
        bytes,
        jsonRx,
        ms: Date.now() - t0,
        err: frames ? null : 'timeout_no_binary',
      });
    }, 12000);

    const ws = new WebSocket(url, { handshakeTimeout: 8000 });
    ws.binaryType = 'nodebuffer';

    function sendHandshake() {
      const msgs = [
        { type: 'connection', params: { useragent: 'FractiAI/Probe', receiver_id: 0 } },
        { type: 'select', params: { frequency: HYDROGEN_HZ, modulation: 'USB' } },
        { type: 'selectfrequency', frequency: HYDROGEN_HZ },
        { type: 'start', params: { frequency: HYDROGEN_HZ } },
        { type: 'client', version: 3, platform: 'node' },
        { type: 'start', params: {} },
        { type: 'select', params: { frequency: HYDROGEN_HZ, mod: 'USB' } },
      ];
      const msg = msgs[handshake % msgs.length];
      handshake++;
      try {
        ws.send(JSON.stringify(msg));
      } catch (_) {}
    }

    ws.on('open', () => {
      sendHandshake();
      const iv = setInterval(sendHandshake, 2500);
      ws._iv = iv;
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary || Buffer.isBuffer(data)) {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        frames++;
        bytes += buf.length;
        clearTimeout(timer);
        if (ws._iv) clearInterval(ws._iv);
        ws.close();
        resolve({ url, ok: true, frames, bytes, jsonRx, ms: Date.now() - t0, err: null });
        return;
      }
      jsonRx++;
    });

    ws.on('error', (e) => {
      clearTimeout(timer);
      if (ws._iv) clearInterval(ws._iv);
      resolve({ url, ok: false, frames: 0, bytes: 0, jsonRx, ms: Date.now() - t0, err: e.message });
    });

    ws.on('close', () => {
      if (frames > 0) return;
    });
  });
}

const results = [];
for (const url of ENDPOINTS) {
  console.log('Probing', url, '…');
  // eslint-disable-next-line no-await-in-loop
  const r = await probe(url);
  results.push(r);
  console.log(JSON.stringify(r));
}
console.log('\nBest:', results.filter((r) => r.ok).sort((a, b) => a.ms - b.ms)[0] || 'none');
