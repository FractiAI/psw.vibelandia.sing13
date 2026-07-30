import { describe, it, expect } from 'vitest';
import {
  normalizeEmail,
  isValidEmailShape,
  makeGuestGrant,
  CREATOR_EMAIL,
} from '../../lib/lattice-access.mjs';

describe('normalizeEmail', () => {
  it('lowercases and trims', () => {
    expect(normalizeEmail('  User@Example.COM  ')).toBe('user@example.com');
  });

  it('strips internal whitespace', () => {
    expect(normalizeEmail('user @ example.com')).toBe('user@example.com');
  });

  it('handles empty string', () => {
    expect(normalizeEmail('')).toBe('');
  });

  it('handles null/undefined gracefully', () => {
    expect(normalizeEmail(null)).toBe('');
    expect(normalizeEmail(undefined)).toBe('');
  });
});

describe('isValidEmailShape', () => {
  it('accepts valid email', () => {
    expect(isValidEmailShape('user@example.com')).toBe(true);
  });

  it('accepts email with subdomain', () => {
    expect(isValidEmailShape('user@sub.example.com')).toBe(true);
  });

  it('rejects missing @', () => {
    expect(isValidEmailShape('userexample.com')).toBe(false);
  });

  it('rejects missing domain', () => {
    expect(isValidEmailShape('user@')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmailShape('')).toBe(false);
  });

  it('rejects spaces', () => {
    expect(isValidEmailShape('user @example.com')).toBe(false);
  });
});

describe('makeGuestGrant', () => {
  it('creates a grant with normalized email', () => {
    const grant = makeGuestGrant(' User@Example.COM ');
    expect(grant.email).toBe('user@example.com');
  });

  it('sets duration to 30 days', () => {
    const grant = makeGuestGrant('test@example.com');
    expect(grant.durationDays).toBe(30);
  });

  it('expiresAt is after grantedAt', () => {
    const grant = makeGuestGrant('test@example.com', new Date('2026-01-01T00:00:00Z'));
    expect(grant.grantedAt).toBe('2026-01-01T00:00:00.000Z');
    expect(grant.expiresAt).toBe('2026-01-31T00:00:00.000Z');
  });

  it('has all required fields', () => {
    const grant = makeGuestGrant('test@example.com');
    expect(grant).toHaveProperty('email');
    expect(grant).toHaveProperty('grantedAt');
    expect(grant).toHaveProperty('expiresAt');
    expect(grant).toHaveProperty('durationDays');
  });
});

describe('CREATOR_EMAIL', () => {
  it('is the expected creator email', () => {
    expect(CREATOR_EMAIL).toBe('valetpru@gmail.com');
  });
});
