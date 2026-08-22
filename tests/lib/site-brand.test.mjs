import { describe, expect, it } from 'vitest';
import { applySiteHomeLabel, SITE_HOME_LABEL } from '../../lib/site-brand.mjs';

describe('site brand · SS VIBELANDIA home label', () => {
  it('exports SS VIBELANDIA as guest home label', () => {
    expect(SITE_HOME_LABEL).toBe('SS VIBELANDIA');
  });

  it('replaces QUESTFEST nav labels in HTML snippets', () => {
    const sample = '<a href="/questfest">QUESTFEST</a> · Back to QUESTFEST';
    expect(applySiteHomeLabel(sample)).toContain('SS VIBELANDIA');
    expect(applySiteHomeLabel(sample)).not.toContain('>QUESTFEST<');
  });
});
