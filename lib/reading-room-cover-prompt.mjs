/**
 * Abstract → visual prompt for Reading Room AI poster covers.
 * Honesty: catalog hospitality art — not empirical proof of paper claims.
 */
import { createHash } from 'node:crypto';

/** @param {{ abstract?: string, displayBlurb?: string, plainLine?: string, title?: string }} item */
export function abstractFocusLine(item) {
  const src = item.abstract || item.displayBlurb || item.plainLine || item.title || '';
  const clean = String(src)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const first = clean.split(/[.!?]\s+/).find((s) => s.length > 12) || clean;
  if (first.length <= 180) return first;
  return first.slice(0, 177).replace(/\s+\S*$/, '') + '…';
}

/** @param {object} item */
export function visualPromptFor(item) {
  const focus = abstractFocusLine(item);
  const category = item.category || 'catalog';
  const shortFocus = focus.length > 100 ? focus.slice(0, 97).replace(/\s+\S*$/, '') + '…' : focus;
  return [
    'Cinematic vertical movie poster',
    'navy blue and antique gold',
    'photorealistic dramatic lighting',
    'single visual metaphor',
    'no text no letters no watermark',
    shortFocus,
    category,
  ].join(', ');
}

/** @param {string} id */
export function coverSeedFor(id) {
  return parseInt(createHash('sha256').update(id).digest('hex').slice(0, 8), 16) % 999999;
}

/** @param {string} prompt @param {number} seed */
export function pollinationsUrl(prompt, seed) {
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=600&nologo=true&seed=${seed}`;
}

/** @param {object} item */
export function coverFallbackUrlFor(item) {
  const prompt = visualPromptFor(item);
  const seed = coverSeedFor(item.id);
  return pollinationsUrl(prompt, seed);
}

/** @param {string} id */
export function readingRoomCoverRelPath(id) {
  return `/interfaces/assets/reading-room-covers/${id}.jpg`;
}
