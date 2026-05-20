const AUDIO_EXT = /\.(mp3|wav|flac|m4a|aac|ogg|opus|wma)$/i;

export function isMediaFile(file: File): boolean {
  if (file.type.startsWith('audio/')) return true;
  return AUDIO_EXT.test(file.name);
}

export function fileSourceKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`;
}

export function titleFromFileName(name: string): string {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || name;
}

export async function collectMediaFiles(files: FileList | File[]): Promise<File[]> {
  return Array.from(files).filter(isMediaFile);
}

export async function scanDirectoryHandle(dir: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = [];

  async function walk(handle: FileSystemDirectoryHandle): Promise<void> {
    for await (const entry of handle.values()) {
      if (entry.kind === 'file') {
        const f = await entry.getFile();
        if (isMediaFile(f)) files.push(f);
      } else if (entry.kind === 'directory') {
        await walk(entry);
      }
    }
  }

  await walk(dir);
  return files;
}

export function supportsDirectoryPicker(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

export async function pickMediaDirectory(): Promise<FileSystemDirectoryHandle | null> {
  if (!supportsDirectoryPicker()) return null;
  try {
    return await window.showDirectoryPicker({ mode: 'read' });
  } catch {
    return null;
  }
}
