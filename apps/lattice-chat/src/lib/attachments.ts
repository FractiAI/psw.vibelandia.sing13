export const LATTICE_ATTACH_MAX_BYTES = 2 * 1024 * 1024;
export const LATTICE_ATTACH_MAX_FILES = 4;
/** Guest Goldilocks text fold cap. Player 1 (creator) has no Lattice-side char/page/file caps. */
export const LATTICE_ATTACH_MAX_TOTAL_CHARS = 120_000;
export const LATTICE_ATTACH_MAX_PDF_PAGES = 40;

export type LatticeAttachOptions = {
  /** Player 1 / creator seat — no Lattice attach caps (platform body limits still apply). */
  unlimited?: boolean;
};

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
  'yaml',
  'yml',
  'toml',
  'svg',
  'log',
  'pdf',
]);

export type LatticeAttachment = {
  name: string;
  mime: string;
  kind: 'image' | 'doc';
  text?: string;
  dataBase64?: string;
  /** Local preview URL for images (revoke on remove). */
  previewUrl?: string;
};

function isPdfFile(name: string, mime: string): boolean {
  if (/^application\/pdf$/i.test(mime)) return true;
  const ext = String(name || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  return ext === 'pdf';
}

export function guessAttachmentKind(name: string, mime: string): 'image' | 'doc' {
  if (/^image\//i.test(mime)) return 'image';
  const ext = String(name || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  if (ext && TEXT_DOC_EXT.has(ext)) return 'doc';
  if (/^text\//i.test(mime) || /json|xml|javascript|typescript/i.test(mime)) return 'doc';
  if (/^application\/pdf$/i.test(mime)) return 'doc';
  return 'doc';
}

const ACCEPT =
  'image/png,image/jpeg,image/gif,image/webp,.png,.jpg,.jpeg,.gif,.webp,.txt,.md,.markdown,.csv,.tsv,.json,.jsonl,.html,.htm,.xml,.css,.js,.mjs,.ts,.tsx,.jsx,.py,.yaml,.yml,.toml,.svg,.log,.pdf,application/pdf';

export function latticeAttachAccept(): string {
  return ACCEPT;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsText(file);
  });
}

/** Edge-only PDF text extract (pdf.js). Scanned/image-only PDFs may yield empty text. */
async function extractPdfText(file: File, opts: LatticeAttachOptions = {}): Promise<string> {
  const pdfjs = await import('pdfjs-dist');
  const workerSrc = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  const data = new Uint8Array(await file.arrayBuffer());
  const doc = await pdfjs.getDocument({ data, useSystemFonts: true }).promise;
  const pages: string[] = [];
  const maxPages = opts.unlimited ? doc.numPages : Math.min(doc.numPages, LATTICE_ATTACH_MAX_PDF_PAGES);
  for (let i = 1; i <= maxPages; i += 1) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const line = content.items
      .map((item) => ('str' in item ? String(item.str || '') : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (line) pages.push(line);
  }
  if (!opts.unlimited && doc.numPages > maxPages) {
    pages.push(`[…PDF truncated after ${maxPages} pages for Goldilocks size…]`);
  }
  return pages.join('\n\n').trim();
}

/** Read guest files into attach payloads (edge-only; never stored server-side). */
export async function readLatticeFiles(
  files: FileList | File[],
  opts: LatticeAttachOptions = {},
): Promise<{
  attachments: LatticeAttachment[];
  errors: string[];
}> {
  const unlimited = Boolean(opts.unlimited);
  const maxFiles = unlimited ? Number.POSITIVE_INFINITY : LATTICE_ATTACH_MAX_FILES;
  const maxBytes = unlimited ? Number.POSITIVE_INFINITY : LATTICE_ATTACH_MAX_BYTES;
  const maxChars = unlimited ? Number.POSITIVE_INFINITY : LATTICE_ATTACH_MAX_TOTAL_CHARS;

  const list = Array.from(files || []).slice(
    0,
    Number.isFinite(maxFiles) ? maxFiles : undefined,
  );
  const attachments: LatticeAttachment[] = [];
  const errors: string[] = [];

  for (const file of list) {
    if (file.size > maxBytes) {
      errors.push(`${file.name}: over 2 MB limit`);
      continue;
    }
    const mime = file.type || 'application/octet-stream';
    const kind = guessAttachmentKind(file.name, mime);
    try {
      if (kind === 'image' || /^image\//i.test(mime)) {
        const dataUrl = await readAsDataUrl(file);
        const dataBase64 = dataUrl.replace(/^data:[^;]+;base64,/i, '');
        attachments.push({
          name: file.name,
          mime: mime.startsWith('image/') ? mime : 'image/png',
          kind: 'image',
          dataBase64,
          previewUrl: URL.createObjectURL(file),
        });
      } else if (isPdfFile(file.name, mime)) {
        const text = await extractPdfText(file, opts);
        if (!text.trim()) {
          errors.push(
            `${file.name}: no extractable text (scanned/image-only PDF). Paste text or use a text PDF.`,
          );
          continue;
        }
        attachments.push({
          name: file.name,
          mime: 'application/pdf',
          kind: 'doc',
          text: Number.isFinite(maxChars) ? text.slice(0, maxChars) : text,
        });
      } else {
        const text = await readAsText(file);
        if (!text.trim()) {
          errors.push(`${file.name}: empty or unreadable as text`);
          continue;
        }
        attachments.push({
          name: file.name,
          mime: mime || 'text/plain',
          kind: 'doc',
          text: Number.isFinite(maxChars) ? text.slice(0, maxChars) : text,
        });
      }
    } catch {
      errors.push(`${file.name}: could not read`);
    }
  }

  return { attachments, errors };
}

export function attachmentsForWire(
  list: LatticeAttachment[],
): Omit<LatticeAttachment, 'previewUrl'>[] {
  return list.map(({ name, mime, kind, text, dataBase64 }) => ({
    name,
    mime,
    kind,
    ...(text ? { text } : {}),
    ...(dataBase64 ? { dataBase64 } : {}),
  }));
}

export function revokeAttachmentPreviews(list: LatticeAttachment[]) {
  for (const a of list) {
    if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
  }
}
