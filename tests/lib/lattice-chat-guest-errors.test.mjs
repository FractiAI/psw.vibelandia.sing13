import { describe, expect, it } from 'vitest';
import {
  isSoftRecoverableLatticeError,
  softenLatticeGuestError,
} from '../../apps/lattice-chat/src/lib/guestErrors.ts';

describe('Lattice Chat guest stream errors', () => {
  it('rewrites Run stream is no longer available without asking for Hard refresh', () => {
    const out = softenLatticeGuestError('Run stream is no longer available');
    expect(out).toMatch(/Check for reply/i);
    expect(out).toMatch(/no refresh needed/i);
    expect(out).not.toMatch(/Hard refresh/i);
    expect(isSoftRecoverableLatticeError(out)).toBe(true);
    expect(isSoftRecoverableLatticeError('Run stream is no longer available')).toBe(true);
  });

  it('keeps hard failures as-is and not soft', () => {
    const msg = 'This email is not on the access list yet.';
    expect(softenLatticeGuestError(msg)).toBe(msg);
    expect(isSoftRecoverableLatticeError(msg)).toBe(false);
  });
});
