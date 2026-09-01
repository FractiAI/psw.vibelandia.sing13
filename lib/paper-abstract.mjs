/** Extract catalog abstract from repo markdown (## Abstract section or lead paragraph). */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const abstractCache = new Map();

function normalizeAbstract(text) {
  if (!text) return null;
  return text
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {string | null | undefined} filePath — repo-relative markdown path
 * @param {{ cwd?: string }} [opts]
 * @returns {Promise<string | null>}
 */
export async function abstractFromMarkdown(filePath, { cwd = process.cwd() } = {}) {
  if (!filePath || !filePath.endsWith('.md')) return null;
  const key = `${cwd}:${filePath}`;
  if (abstractCache.has(key)) return abstractCache.get(key);

  let out = null;
  try {
    const raw = await readFile(join(cwd, filePath), 'utf8');
    const abstractMatch = raw.match(
      /^## Abstract[^\n]*\n+([\s\S]*?)(?=\n## |\n---\s*\n|\n# |\n\*\*SynthOBS|\n\*\*Operator|\n\*\*Honesty|$)/im,
    );
    if (abstractMatch) {
      out = normalizeAbstract(abstractMatch[1]);
    } else {
      const leadMatch = raw.match(
        /^#[^\n]+\n+(?:\*\*[^\n]+\*\*\n+)?(?:>[^\n]+\n+)*\n*([^\n#>*\-|][^\n]+)/m,
      );
      if (leadMatch) out = normalizeAbstract(leadMatch[1]);
    }
    if (out && out.length > 900) out = `${out.slice(0, 897).trim()}…`;
  } catch {
    out = null;
  }
  abstractCache.set(key, out);
  return out;
}
