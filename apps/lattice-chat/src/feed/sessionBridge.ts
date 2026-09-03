/** Format Collaborate DM → Lattice Chat session handoff payloads. */
import type { UnifiedFeedItem } from './types';

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

/** Mirror a shared-agent seat message into the Collaborate DM feed (unread until opened). */
export function agentSeatMessageToDmEnvelope(msg: {
  id: string;
  content: string;
  createdAt: string;
  senderPeerId: string;
  senderName?: string;
}): Record<string, unknown> {
  return {
    id: `agent_mirror_${msg.id}`,
    type: 'chat',
    platform: 'lattice',
    actor: msg.senderName || 'Seat',
    body: msg.content,
    threadPeerId: msg.senderPeerId,
    presenceHue: 'purple',
    createdAt: msg.createdAt,
  };
}
