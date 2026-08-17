import { beforeEach, describe, expect, it } from 'vitest';
import {
  getTrackPlays,
  incrementTrackPlays,
  normalizeTrackId,
  trackPlayPageKey,
} from '../../lib/catalog-plays.mjs';

describe('catalog track plays (global visits)', () => {
  beforeEach(() => {
    globalThis.__qvPageViews?.clear?.();
  });

  it('normalizes track ids into a dedicated play key (not a page path)', () => {
    expect(normalizeTrackId('  abc/def  ')).toBe('abc_def');
    expect(trackPlayPageKey('song-1')).toBe('/track-play/song-1');
    expect(trackPlayPageKey('')).toBe('');
  });

  it('increments all-listener plays for a track', async () => {
    const a = await incrementTrackPlays('track-alpha');
    const b = await incrementTrackPlays('track-alpha');
    const other = await incrementTrackPlays('track-beta');
    const read = await getTrackPlays('track-alpha');

    expect(a.plays).toBe(1);
    expect(b.plays).toBe(2);
    expect(other.plays).toBe(1);
    expect(read.plays).toBe(2);
    expect(read.key).toContain('track-play');
  });
});
