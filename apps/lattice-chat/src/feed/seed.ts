import type {
  CollabPeer,
  IntegrationConfig,
  RepoFileNode,
  UnifiedFeedItem,
} from '@/feed/types';

/** Integrations start off — guest enables what they use. */
export const DEFAULT_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'facebook',
    label: 'Facebook',
    enabled: false,
    accountLabel: '',
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    enabled: false,
    accountLabel: '',
  },
  {
    id: 'github',
    label: 'GitHub',
    enabled: false,
    accountLabel: '',
  },
  {
    id: 'gitlab',
    label: 'GitLab',
    enabled: false,
    accountLabel: '',
  },
];

/** Event types guests may opt into once a feed is connected. */
export const DEFAULT_EVENT_FILTERS: Record<string, boolean> = {
  commits: true,
  pushes: true,
  merges: true,
  whitepapers: true,
  social_posts: true,
  messaging: true,
};

/** Live seat roster for now: creator + Daniel only. */
export const WORKSPACE_PEERS: CollabPeer[] = [
  {
    id: 'peer_valet_pru',
    name: 'Valet Pru',
    hue: 'gold',
    online: true,
    platform: 'lattice',
  },
  {
    id: 'peer_daniel',
    name: 'Daniel',
    hue: 'purple',
    online: true,
    platform: 'lattice',
  },
];

/** Empty until a GitHub/GitLab feed attaches a tree. */
export const EMPTY_REPO_FILES: RepoFileNode[] = [];

export const DEFAULT_REPO_NAME = 'No repository connected';

/** Fresh workspace — no synthetic timeline. */
export function emptyFeed(): UnifiedFeedItem[] {
  return [];
}
