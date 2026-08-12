/** Map signed-in Lattice email → Collaborate seat peer id (client mirror of server). */
import { isCreatorEmail, normalizeEmail } from '@/access';
import { WORKSPACE_PEERS } from '@/feed/seed';

const GUEST_SEATS: Record<string, string> = {
  'danielarifriedman@gmail.com': 'peer_daniel',
};

export function resolveClientCollabPeerId(email: string | null | undefined): string | null {
  const e = normalizeEmail(email || '');
  if (!e) return null;
  if (GUEST_SEATS[e]) return GUEST_SEATS[e];
  if (isCreatorEmail(e)) return 'peer_valet_pru';
  return null;
}

export function peerNameForId(peerId: string): string {
  return WORKSPACE_PEERS.find((p) => p.id === peerId)?.name || 'Peer';
}

export function peerHueForId(peerId: string): 'green' | 'purple' | 'gold' | 'cyan' {
  return WORKSPACE_PEERS.find((p) => p.id === peerId)?.hue || 'purple';
}
