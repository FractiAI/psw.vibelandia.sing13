/**
 * Lattice guest attachments — unit locks for fold + Claude vision blocks.
 */
import { describe, expect, it } from 'vitest';
import {
  buildClaudeUserContent,
  buildCursorPromptImages,
  buildCursorSendMessage,
  foldAttachmentsIntoMessage,
  latticeProviderSeesImages,
  normalizeLatticeAttachments,
} from '../../lib/lattice-attachments.mjs';

describe('lattice-attachments', () => {
  it('normalizes image + text doc payloads', () => {
    const list = normalizeLatticeAttachments([
      { name: 'a.png', mime: 'image/png', kind: 'image', dataBase64: 'abc123' },
      { name: 'note.md', mime: 'text/markdown', text: '# Hello' },
      { name: 'skip.bin', mime: 'application/octet-stream', kind: 'doc' },
    ]);
    expect(list).toHaveLength(2);
    expect(list[0].kind).toBe('image');
    expect(list[1].text).toContain('Hello');
  });

  it('folds docs into Cursor/Gemini text prompts', () => {
    const folded = foldAttachmentsIntoMessage('Please review', [
      { name: 'plan.txt', mime: 'text/plain', kind: 'doc', text: 'Step one' },
    ]);
    expect(folded).toContain('Please review');
    expect(folded).toContain('Step one');
    expect(folded).toContain('plan.txt');
  });

  it('folds Cursor-capable images as vision, not a Claude-only stub', () => {
    const folded = foldAttachmentsIntoMessage(
      'Use this poster',
      [{ name: 'voyage.png', mime: 'image/png', kind: 'image', dataBase64: 'abc' }],
      { visionCapable: true },
    );
    expect(folded).toContain('Use this poster');
    expect(folded).toContain('voyage.png');
    expect(folded).toMatch(/vision block/i);
    expect(folded).not.toMatch(/switch to Claude/i);
  });

  it('builds Cursor SDK prompt.images and send payload', () => {
    const images = buildCursorPromptImages([
      { name: 'a.jpg', mime: 'image/jpg', kind: 'image', dataBase64: 'ZmFrZQ==' },
      { name: 'note.md', mime: 'text/markdown', text: 'hello' },
    ]);
    expect(images).toEqual([{ data: 'ZmFrZQ==', mimeType: 'image/jpeg' }]);
    const payload = buildCursorSendMessage('Look', [
      { name: 'a.png', mime: 'image/png', kind: 'image', dataBase64: 'abc' },
    ]);
    expect(payload).toEqual({
      text: 'Look',
      images: [{ data: 'abc', mimeType: 'image/png' }],
    });
    expect(buildCursorSendMessage('plain', [])).toBe('plain');
    expect(latticeProviderSeesImages('cursor')).toBe(true);
    expect(latticeProviderSeesImages('gemini')).toBe(false);
  });

  it('builds Claude multimodal content for images', () => {
    const content = buildClaudeUserContent('What is this?', [
      { name: 'deck.png', mime: 'image/png', kind: 'image', dataBase64: 'ZmFrZQ==' },
    ]);
    expect(Array.isArray(content)).toBe(true);
    expect(content[0].type).toBe('image');
    expect(content[0].source.data).toBe('ZmFrZQ==');
    expect(content[1].type).toBe('text');
    expect(content[1].text).toContain('What is this?');
  });
});
