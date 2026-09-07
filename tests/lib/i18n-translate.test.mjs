import { describe, expect, it } from 'vitest';
import {
  chunkText,
  shouldSkipTranslate,
  mymemoryTarget,
  translateOne,
  translateMany,
} from '../../lib/i18n-translate.mjs';

describe('i18n-translate helpers', () => {
  it('maps vibelandia locales to MyMemory targets', () => {
    expect(mymemoryTarget('en')).toBeNull();
    expect(mymemoryTarget('es')).toBe('es');
    expect(mymemoryTarget('zh')).toBe('zh-CN');
    expect(mymemoryTarget('zh-TW')).toBe('zh-TW');
  });

  it('chunks long text on spaces', () => {
    const s = 'word '.repeat(100).trim();
    const parts = chunkText(s, 40);
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.join(' ').replace(/\s+/g, ' ')).toContain('word');
  });

  it('skips URLs numbers and empties', () => {
    expect(shouldSkipTranslate('')).toBe(true);
    expect(shouldSkipTranslate('https://example.com/x')).toBe(true);
    expect(shouldSkipTranslate('42')).toBe(true);
    expect(shouldSkipTranslate('Hello world')).toBe(false);
  });

  it('falls back to source text when MyMemory fetch aborts', async () => {
    const fetchImpl = async () => {
      const err = new Error('Aborted');
      err.name = 'AbortError';
      throw err;
    };
    const out = await translateOne('Language', 'es', { fetchImpl, timeoutMs: 50 });
    expect(out).toBe('Language');
  });
});

describe('i18n-translate live (MyMemory)', () => {
  it('translates a short English phrase to Spanish', async (ctx) => {
    const out = await translateOne('Language', 'es', { timeoutMs: 8000 });
    // Soft-skip when the public API is down/slow — CI must not fail on MyMemory weather.
    if (!out || out === 'Language') {
      ctx.skip();
      return;
    }
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  }, 20000);

  it('batch translates preserving length', async (ctx) => {
    const texts = ['Listen', 'Read the note'];
    const out = await translateMany(texts, 'es', { concurrency: 2, timeoutMs: 8000 });
    expect(out).toHaveLength(2);
    if (out.every((t, i) => t === texts[i])) {
      ctx.skip();
      return;
    }
    expect(out.every((t) => typeof t === 'string' && t.length > 0)).toBe(true);
  }, 30000);
});
