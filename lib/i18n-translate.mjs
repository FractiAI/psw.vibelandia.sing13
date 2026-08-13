/**
 * Batch EN→target translation via MyMemory (no API key).
 * Used by /api/i18n-translate for surface + paper live i18n.
 */

const MYMEMORY = 'https://api.mymemory.translated.net/get';

/** Map Vibelandia locale codes → MyMemory langpair target. */
export const LOCALE_TO_MYMEMORY = {
  es: 'es',
  fr: 'fr',
  de: 'de',
  pt: 'pt',
  zh: 'zh-CN',
  'zh-TW': 'zh-TW',
  ja: 'ja',
  ko: 'ko',
  ar: 'ar',
};

export function mymemoryTarget(locale) {
  if (!locale || locale === 'en') return null;
  return LOCALE_TO_MYMEMORY[locale] || locale.split('-')[0] || null;
}

/** Split long strings into ≤ maxLen chunks on whitespace when possible. */
export function chunkText(text, maxLen = 420) {
  const s = String(text || '');
  if (s.length <= maxLen) return [s];
  const out = [];
  let rest = s;
  while (rest.length > maxLen) {
    let cut = rest.lastIndexOf(' ', maxLen);
    if (cut < maxLen * 0.4) cut = maxLen;
    out.push(rest.slice(0, cut));
    rest = rest.slice(cut).replace(/^\s+/, '');
  }
  if (rest) out.push(rest);
  return out;
}

/**
 * Translate one string. Returns original on failure.
 * @param {string} text
 * @param {string} targetLocale vibelandia code (es, zh-TW, …)
 * @param {{ fetchImpl?: typeof fetch, source?: string }} [opts]
 */
export async function translateOne(text, targetLocale, opts = {}) {
  const target = mymemoryTarget(targetLocale);
  if (!target || !text || !String(text).trim()) return text;
  const source = opts.source || 'en';
  const fetchImpl = opts.fetchImpl || fetch;
  const chunks = chunkText(text, 420);
  const parts = [];
  for (const chunk of chunks) {
    const url =
      MYMEMORY +
      '?q=' +
      encodeURIComponent(chunk) +
      '&langpair=' +
      encodeURIComponent(source + '|' + target);
    try {
      const r = await fetchImpl(url, { headers: { Accept: 'application/json' } });
      if (!r.ok) {
        parts.push(chunk);
        continue;
      }
      const data = await r.json();
      const translated =
        data?.responseData?.translatedText ||
        data?.matches?.[0]?.translation ||
        null;
      parts.push(translated && String(translated).trim() ? translated : chunk);
    } catch {
      parts.push(chunk);
    }
  }
  return parts.join(chunks.length > 1 && /\s$/.test(text) === false ? ' ' : '');
}

/**
 * Translate many strings with modest concurrency.
 * @param {string[]} texts
 * @param {string} targetLocale
 * @param {{ concurrency?: number, fetchImpl?: typeof fetch }} [opts]
 */
export async function translateMany(texts, targetLocale, opts = {}) {
  const list = Array.isArray(texts) ? texts : [];
  const concurrency = Math.max(1, Math.min(4, opts.concurrency || 3));
  const out = new Array(list.length);
  let i = 0;
  async function worker() {
    while (i < list.length) {
      const idx = i++;
      out[idx] = await translateOne(list[idx], targetLocale, opts);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, list.length) }, () => worker()));
  return out;
}

/** Skip strings that should stay literal. */
export function shouldSkipTranslate(text) {
  const t = String(text || '').trim();
  if (!t) return true;
  if (t.length < 2) return true;
  // URLs, emails, paths, pure codes
  if (/^https?:\/\//i.test(t)) return true;
  if (/^[\w.+-]+@[\w.-]+\.\w+$/.test(t)) return true;
  if (/^\/[\w./?#&=%-]*$/.test(t)) return true;
  if (/^[0-9\s.,:%°ΩφπΔ±×÷+\-/=$]+$/u.test(t)) return true;
  if (/^[\u2200-\u22FF\u0370-\u03FF\s0-9.,]+$/u.test(t) && t.length < 40) return true;
  return false;
}
