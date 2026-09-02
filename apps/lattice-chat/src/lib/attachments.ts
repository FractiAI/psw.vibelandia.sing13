export const LATTICE_ATTACH_MAX_BYTES = 2 * 1024 * 1024;
export const LATTICE_ATTACH_MAX_FILES = 4;

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

export function guessAttachmentKind(name: string, mime: string): 'image' | 'doc' {
  if (/^image\//i.test(mime)) return 'image';
  const ext = String(name || '')
    .split('.')
    .pop()
    ?.toLowerCase();
  if (ext && TEXT_DOC_EXT.has(ext)) return 'doc';
  if (/^text\//i.test(mime) || /json|xml|javascript|typescript/i.test(mime)) return 'doc';
  return 'doc';
}

const ACCEPT =
  'image/png,image/jpeg,image/gif,image/webp,.png,.jpg,.jpeg,.gif,.webp,.txt,.md,.markdown,.csv,.tsv,.json,.jsonl,.html,.htm,.xml,.css,.js,.mjs,.ts,.tsx,.jsx,.py,.yaml,.yml,.toml,.svg,.log';

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

/** Read guest files into attach payloads (edge-only; never stored server-side). */
export async function readLatticeFiles(files: FileList | File[]): Promise<{
  attachments: LatticeAttachment[];
  errors: string[];
}> {
  const list = Array.from(files || []).slice(0, LATTICE_ATTACH_MAX_FILES);
  const attachments: LatticeAttachment[] = [];
  const errors: string[] = [];

  for (const file of list) {
    if (file.size > LATTICE_ATTACH_MAX_BYTES) {
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
          text: text.slice(0, 120_000),
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
