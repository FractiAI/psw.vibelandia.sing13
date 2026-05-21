/**
 * Normalize WebSDR / OpenWebRX binary payloads to Float32 samples for φ DSP.
 */

export function isPlausibleFloatIQ(f32) {
  if (!f32 || f32.length < 8) return false;
  let finite = 0;
  for (let i = 0; i < Math.min(64, f32.length); i++) {
    if (Number.isFinite(f32[i]) && Math.abs(f32[i]) <= 8) finite++;
  }
  return finite >= 8;
}

/** Decode raw bytes → normalized float samples (IQ or demod audio). */
export function decodeIQBuffer(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const len = u8.byteLength;
  if (len < 8) return null;

  if (len % 4 === 0) {
    const f32 = new Float32Array(u8.buffer, u8.byteOffset, len / 4);
    if (isPlausibleFloatIQ(f32)) return f32;
  }

  if (len % 2 === 0) {
    const i16 = new Int16Array(u8.buffer, u8.byteOffset, len / 2);
    const out = new Float32Array(i16.length);
    for (let i = 0; i < i16.length; i++) out[i] = i16[i] / 32768;
    return out;
  }

  const out = new Float32Array(len);
  for (let i = 0; i < len; i++) out[i] = (u8[i] - 128) / 128;
  return out;
}

/**
 * OpenWebRX binary frame: byte0 = type (1 FFT, 2 audio, 3 secondary FFT, 4 HD audio).
 * Returns { type, samples } or null.
 */
export function decodeOpenWebRxBinary(buf) {
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  if (u8.byteLength < 9) return null;
  const frameType = u8[0];
  const payload = u8.subarray(1);

  if (frameType === 2 || frameType === 4) {
    const samples = decodeIQBuffer(payload);
    if (!samples || samples.length < 8) return null;
    return { type: frameType === 4 ? 'hd_audio' : 'audio', samples };
  }

  if (frameType === 1 || frameType === 3) {
    if (payload.byteLength % 4 === 0) {
      const f32 = new Float32Array(payload.buffer, payload.byteOffset, payload.byteLength / 4);
      if (f32.length >= 8) return { type: 'fft', samples: f32 };
    }
    const samples = decodeIQBuffer(payload);
    if (samples && samples.length >= 8) return { type: 'fft', samples };
  }

  return null;
}
