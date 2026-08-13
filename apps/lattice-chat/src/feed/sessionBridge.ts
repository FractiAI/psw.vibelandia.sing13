/** Format Collaborate DM → Lattice Chat session handoff payloads. */
import type { UnifiedFeedItem } from '@/feed/types';

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
