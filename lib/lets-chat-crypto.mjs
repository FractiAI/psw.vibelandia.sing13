/**
 * Let's Chat · fractal encryption helpers (EGS frontal constant salt).
 * Honesty: catalog-grade AES-GCM envelope — not a post-quantum or clinical claim.
 */
import { createHash } from 'node:crypto';
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
