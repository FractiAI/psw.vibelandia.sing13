/**
 * Lattice Chat guest attachments — images + text docs on the BYOK pipe.
 * Honesty: Claude Messages API can receive vision blocks; Cursor / Gemini
 * Antigravity pipes fold text docs into the prompt and note image limits.
 */

export const LATTICE_ATTACH_MAX_FILES = 4;
export const LATTICE_ATTACH_MAX_BYTES = 4 * 1024 * 1024; // 4 MiB each
export const LATTICE_ATTACH_MAX_TOTAL_CHARS = 120_000;

const TEXT_DOC_EXT = new Set([
  'txt',
  'md',
  'markdown',
  'csv',
  'tsv',
  'json',
  'jsonl',
  'html',
  'htm',
  'xml',
  'css',
  'js',
  'mjs',
  'cjs',
  'ts',
  'tsx',
  'jsx',
  'py',
  'rb',
  'go',
  'rs',
  'java',
  'c',
  'h',
  'cpp',
  'hpp',
  'sh',
  'yaml',
  'yml',
  'toml',
  'ini',
  'log',
  'svg',
]);

/**
 * @param {unknown} raw
 * @returns {{ name: string, mime: string, kind: 'image' | 'doc', text?: string, dataBase64?: string }[]}
 */
export function normalizeLatticeAttachments(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const item of raw.slice(0, LATTICE_ATTACH_MAX_FILES)) {
    if (!item || typeof item !== 'object') continue;
    const name = String(item.name || 'attachment').slice(0, 180);
    const mime = String(item.mime || item.type || 'application/octet-stream').slice(0, 120);
    const kind =
      item.kind === 'image' || /^image\//i.test(mime)
        ? 'image'
        : 'doc';
    /** @type {{ name: string, mime: string, kind: 'image' | 'doc', text?: string, dataBase64?: string }} */
    const row = { name, mime, kind };
    if (typeof item.text === 'string' && item.text.trim()) {
      row.text = item.text.slice(0, LATTICE_ATTACH_MAX_TOTAL_CHARS);
    }
    if (typeof item.dataBase64 === 'string' && item.dataBase64.trim()) {
      // Strip data-URL prefix if present
      row.dataBase64 = item.dataBase64.replace(/^data:[^;]+;base64,/i, '').trim();
    }
    if (kind === 'image' && !row.dataBase64) continue;
    if (kind === 'doc' && !row.text && !row.dataBase64) continue;
    out.push(row);
  }
  return out;
}

/**
 * @param {string} name
 * @param {string} mime
 */
export function guessAttachmentKind(name, mime) {
  if (/^image\//i.test(mime)) return 'image';
  const ext = String(name || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  if (ext && TEXT_DOC_EXT.has(ext)) return 'doc';
  if (/^text\//i.test(mime) || /json|xml|javascript|typescript/i.test(mime)) return 'doc';
  return 'doc';
}

/**
 * Fold attachments into a single user message string (Cursor / Gemini / history).
 * @param {string} message
 * @param {ReturnType<typeof normalizeLatticeAttachments>} attachments
 * @param {{ visionCapable?: boolean }} [opts]
 */
export function foldAttachmentsIntoMessage(message, attachments, opts = {}) {
  const visionCapable = Boolean(opts.visionCapable);
  const base = String(message || '').trim();
  if (!attachments?.length) return base;

  const parts = [];
  if (base) parts.push(base);
  parts.push('');
  parts.push('--- Guest attachments ---');

  for (const a of attachments) {
    if (a.kind === 'image') {
      if (visionCapable) {
        parts.push(`[Image attached: ${a.name} (${a.mime}) — also sent as vision block]`);
      } else {
        parts.push(
          `[Image attached: ${a.name} (${a.mime}). This provider pipe is text-first — switch to Claude for vision, or describe what you see in the image.]`,
        );
      }
      continue;
    }
    if (a.text) {
      parts.push(`[Document: ${a.name} (${a.mime})]`);
      parts.push(a.text);
      parts.push(`[End document: ${a.name}]`);
    } else {
      parts.push(
        `[Document: ${a.name} (${a.mime}) — binary/not extracted. Paste text or use a .txt/.md/.json file.]`,
      );
    }
  }

  let folded = parts.join('\n').trim();
  if (folded.length > LATTICE_ATTACH_MAX_TOTAL_CHARS) {
    folded = `${folded.slice(0, LATTICE_ATTACH_MAX_TOTAL_CHARS)}\n\n[…attachments truncated for Goldilocks size…]`;
  }
  return folded;
}

/**
 * Anthropic Messages API user content blocks (text + images).
 * @param {string} message
 * @param {ReturnType<typeof normalizeLatticeAttachments>} attachments
 */
export function buildClaudeUserContent(message, attachments) {
  const list = normalizeLatticeAttachments(attachments);
  const text = foldAttachmentsIntoMessage(message, list, { visionCapable: true });
  if (!list.some((a) => a.kind === 'image' && a.dataBase64)) {
    return text;
  }
  /** @type {Array<Record<string, unknown>>} */
  const blocks = [];
  for (const a of list) {
    if (a.kind !== 'image' || !a.dataBase64) continue;
    const mediaType = /^image\/(png|jpeg|gif|webp)$/i.test(a.mime) ? a.mime : 'image/png';
    blocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: mediaType,
        data: a.dataBase64,
      },
    });
  }
  blocks.push({ type: 'text', text: text || '(Guest sent image(s) with no caption.)' });
  return blocks;
}

/**
 * Display label for chat bubble (no base64 dump).
 * @param {string} message
 * @param {ReturnType<typeof normalizeLatticeAttachments>} attachments
 */
export function formatAttachmentReceipt(message, attachments) {
  const list = normalizeLatticeAttachments(attachments);
  const base = String(message || '').trim();
  if (!list.length) return base;
  const labels = list.map((a) => `${a.kind === 'image' ? '🖼' : '📄'} ${a.name}`).join(' · ');
  return base ? `${base}\n\nAttached: ${labels}` : `Attached: ${labels}`;
}
