import { describe, expect, it } from 'vitest';
import { faviconBadgeLabel } from '../../apps/lattice-chat/src/lib/tabFavicon.ts';

describe('tab favicon badge label', () => {
  it('hides the badge when there are no unread DMs', () => {
    expect(faviconBadgeLabel(0)).toBe(null);
    expect(faviconBadgeLabel(-1)).toBe(null);
    expect(faviconBadgeLabel(Number.NaN)).toBe(null);
  });

  it('shows 1–9 then 9+', () => {
    expect(faviconBadgeLabel(1)).toBe('1');
    expect(faviconBadgeLabel(9)).toBe('9');
    expect(faviconBadgeLabel(10)).toBe('9+');
    expect(faviconBadgeLabel(42)).toBe('9+');
  });
});
