/** Format Collaborate DM ↔ Lattice Chat session handoff payloads. */
import type { UnifiedFeedItem } from '@/feed/types';
import type { ChatMessage } from '@/types';

export type DmThreadLine = Pick<UnifiedFeedItem, 'actor' | 'body' | 'createdAt'>;

/** Build a Lattice Chat seed prompt from a Collaborate DM thread. */
export function formatDmThreadForAgent(
  peerName: string,
  items: DmThreadLine[],
  opts: { maxChars?: number } = {},
): string {
  const maxChars = opts.maxChars ?? 4000;
  const lines = [
    `Continue this Collaborate DM with ${peerName} inside Lattice Chat Agent.`,
    `Help as Goldilocks Valet — keep the seat conversation context.`,
    '',
    `--- DM · ${peerName} ---`,
  ];
  for (const m of items) {
    const who = m.actor === 'You' ? 'You' : m.actor || peerName;
    const body = String(m.body || '').trim();
    if (!body) continue;
    lines.push(`${who}: ${body}`);
  }
  lines.push('--- end DM ---', '', 'Respond with next useful steps for this conversation.');
  return lines.join('\n').slice(0, maxChars);
}

/** Build a Collaborate DM body from a Lattice Chat session transcript. */
export function formatChatThreadForDm(
  title: string,
  messages: Array<Pick<ChatMessage, 'role' | 'content'>>,
  opts: { maxChars?: number; maxMessages?: number } = {},
): string {
  const maxChars = opts.maxChars ?? 3500;
  const maxMessages = opts.maxMessages ?? 12;
  const slice = messages.slice(-maxMessages);
  const lines = [`[Lattice Chat session · ${title || 'Untitled'}]`];
  for (const m of slice) {
    const content = String(m.content || '').trim();
    if (!content) continue;
    const who = m.role === 'user' ? 'You' : m.role === 'assistant' ? 'Agent' : m.role;
    lines.push(`${who}: ${content.slice(0, 600)}`);
  }
  if (lines.length === 1) {
    lines.push('(Empty session — opened from Lattice Chat.)');
  }
  return lines.join('\n').slice(0, maxChars);
}
