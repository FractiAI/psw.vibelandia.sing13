/**
 * Let's Chat · fractal encryption helpers (EGS frontal constant salt).
 * Honesty: catalog-grade AES-GCM envelope — not a post-quantum or clinical claim.
 */
import { createHash, createCipheriv, randomBytes } from 'node:crypto';
import { EGS_FRONTAL_CONSTANT, letsChatThreadId } from './lets-chat-peers.mjs';

export { EGS_FRONTAL_CONSTANT };

/** Deterministic thread key material (client mirrors via Web Crypto). */
export function deriveThreadKeyMaterial(peerA, peerB) {
  const threadId = letsChatThreadId(peerA, peerB);
  const seed = `${EGS_FRONTAL_CONSTANT}|lets-chat|v1|${threadId}`;
  const digest = createHash('sha256').update(seed, 'utf8').digest();
  return { threadId, keyBytes: digest };
}

/** Base64url encode for browser parity tests. */
export function toBase64Url(buf) {
  return Buffer.from(buf)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Server-side AES-GCM encrypt matching the Let's Chat edge client
 * (12-byte IV + ciphertext+tag, base64url).
 * @param {string} peerA
 * @param {string} peerB
 * @param {string} plain
 */
export function encryptLetsChatPlaintext(peerA, peerB, plain) {
  const { threadId, keyBytes } = deriveThreadKeyMaterial(peerA, peerB);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyBytes, iv);
  const enc = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, enc, tag]);
  return { threadId, ciphertext: toBase64Url(combined) };
}
