import type {
  CollabPeer,
  IntegrationConfig,
  RepoFileNode,
  UnifiedFeedItem,
} from '@/feed/types';

export const DEFAULT_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'facebook',
    label: 'Machote Moderno (FB)',
    enabled: true,
    accountLabel: 'Machote Moderno',
  },
  {
    id: 'whatsapp',
    label: 'Team Collab (WhatsApp)',
    enabled: true,
    accountLabel: 'Team Collab',
  },
  {
    id: 'github',
    label: 'GitHub (Project Phoenix)',
    enabled: true,
    accountLabel: 'Project Phoenix',
  },
  {
    id: 'gitlab',
    label: 'GitLab',
    enabled: false,
    accountLabel: 'GitLab',
  },
];

export const DEFAULT_EVENT_FILTERS: Record<string, boolean> = {
  commits: true,
  pushes: true,
  merges: true,
  whitepapers: true,
  social_posts: true,
  messaging: true,
};

export const SEED_PEERS: CollabPeer[] = [
  { id: 'peer_alex', name: 'Alex', hue: 'green', online: true, typing: true, platform: 'whatsapp' },
  { id: 'peer_maria', name: 'Maria', hue: 'purple', online: true, platform: 'lattice' },
  { id: 'peer_pru', name: 'Valet Pru', hue: 'gold', online: true, platform: 'lattice' },
];

export const SEED_REPO_FILES: RepoFileNode[] = [
  { id: 'f_ui', name: 'UI/', kind: 'folder', path: 'UI' },
  { id: 'f_readme_md', name: 'readme.md', kind: 'file', path: 'readme.md' },
  { id: 'f_readme_txd', name: 'readme.txd', kind: 'file', path: 'readme.txd' },
  {
    id: 'f_index_a',
    name: 'index.html',
    kind: 'file',
    path: 'UI/index.html',
    presence: [{ peerId: 'peer_alex', hue: 'green' }],
  },
  {
    id: 'f_index_b',
    name: 'index.html',
    kind: 'file',
    path: 'index.html',
    presence: [{ peerId: 'peer_maria', hue: 'purple' }],
  },
  { id: 'f_readme2', name: 'README.md', kind: 'file', path: 'README.md' },
  {
    id: 'f_whitepaper',
    name: 'Brutalist_Architecture_White-paper.pdf',
    kind: 'file',
    path: 'docs/Brutalist_Architecture_White-paper.pdf',
  },
];

export function buildSeedFeed(now = Date.now()): UnifiedFeedItem[] {
  const t = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();
  return [
    {
      id: 'seed_chat_1',
      kind: 'chat',
      platform: 'lattice',
      createdAt: t(45),
      actor: 'Unified Feed',
      sourceLabel: 'Lattice',
      body: 'Hey team, dynamic context rules updated.',
      presenceHue: 'gold',
    },
    {
      id: 'seed_git_1',
      kind: 'git_event',
      platform: 'github',
      createdAt: t(40),
      actor: 'Alex',
      sourceLabel: 'Automated',
      body: '3 New Commits Pushed by Alex',
      git: {
        action: 'push',
        repo: 'Project Phoenix',
        author: 'Alex',
        commitCount: 3,
        summary: '3 New Commits Pushed by Alex',
        compareUrl: 'https://github.com/FractiAI/psw.vibelandia.sing13/compare',
        branch: 'main',
      },
    },
    {
      id: 'seed_fb_1',
      kind: 'social_post',
      platform: 'facebook',
      createdAt: t(35),
      actor: 'Machote Moderno',
      sourceLabel: 'Facebook',
      body: 'New Issue Alert: The intersection of brutalist architecture and 90s digital culture. Read now!',
      social: {
        network: 'facebook',
        author: 'Machote Moderno',
        title: 'New Issue Alert: The intersection of brutalist architecture and 90s digital culture. Read now!',
        url: '/papers',
      },
    },
    {
      id: 'seed_wa_1',
      kind: 'messaging',
      platform: 'whatsapp',
      createdAt: t(12),
      actor: 'Alex',
      sourceLabel: 'WhatsApp',
      body: 'Check the new merge in the UI folder.',
      messaging: {
        network: 'whatsapp',
        from: 'Alex',
        body: 'Check the new merge in the UI folder.',
      },
      presenceHue: 'green',
    },
    {
      id: 'seed_chat_2',
      kind: 'chat',
      platform: 'lattice',
      createdAt: t(10),
      actor: 'Maria',
      sourceLabel: 'Lattice',
      body: "I'm reviewing index.html now.",
      presenceHue: 'purple',
    },
    {
      id: 'seed_art_1',
      kind: 'artifact',
      platform: 'lattice',
      createdAt: t(8),
      actor: 'Maria',
      sourceLabel: 'Artifact',
      body: 'Brutalist Architecture White-paper',
      artifact: {
        title: 'Brutalist Architecture White-paper',
        kind: 'whitepaper',
        path: 'docs/Brutalist_Architecture_White-paper.pdf',
      },
    },
  ];
}
