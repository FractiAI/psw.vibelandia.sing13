/** Lattice Collaborate · unified interaction stream types */

export type FeedPlatform = 'lattice' | 'github' | 'gitlab' | 'facebook' | 'whatsapp';

export type FeedItemKind =
  | 'chat'
  | 'social_post'
  | 'messaging'
  | 'git_event'
  | 'artifact';

export type GitEventAction = 'commit' | 'push' | 'merge' | 'branch' | 'pr';

export type EventFilterKey =
  | 'commits'
  | 'pushes'
  | 'merges'
  | 'whitepapers'
  | 'social_posts'
  | 'messaging';

export type IntegrationId = 'github' | 'whatsapp' | 'facebook' | 'gitlab';

export type IntegrationConfig = {
  id: IntegrationId;
  label: string;
  enabled: boolean;
  accountLabel: string;
  /** Last verify attempt */
  connectionStatus?: 'idle' | 'checking' | 'connected' | 'error';
  connectionMessage?: string;
  connectionHint?: string;
};

export type GitPayload = {
  action: GitEventAction;
  repo: string;
  branch?: string;
  author?: string;
  commitCount?: number;
  summary: string;
  compareUrl?: string;
  sha?: string;
};

export type SocialPayload = {
  network: 'facebook' | 'instagram' | 'other';
  author: string;
  title: string;
  body?: string;
  url?: string;
  avatarUrl?: string;
};

export type MessagingPayload = {
  network: 'whatsapp' | 'signal' | 'sms' | 'other';
  from: string;
  body: string;
  threadId?: string;
};

export type ArtifactPayload = {
  title: string;
  kind: 'whitepaper' | 'pdf' | 'asset' | 'other';
  path?: string;
  url?: string;
  paperId?: string;
  docId?: string | null;
  published?: string | null;
  featured?: boolean;
  auditStatus?: string | null;
};

export type UnifiedFeedItem = {
  id: string;
  kind: FeedItemKind;
  platform: FeedPlatform;
  createdAt: string;
  /** Display name in the stream */
  actor: string;
  /** Short status line (e.g. Automated, Facebook) */
  sourceLabel: string;
  body?: string;
  /** Seat chat thread — peer id when kind is chat */
  threadPeerId?: string;
  git?: GitPayload;
  social?: SocialPayload;
  messaging?: MessagingPayload;
  artifact?: ArtifactPayload;
  /** Presence color key matching peer */
  presenceHue?: 'green' | 'purple' | 'gold' | 'cyan';
};

export type RepoFileNode = {
  id: string;
  name: string;
  kind: 'folder' | 'file';
  path: string;
  presence?: Array<{ peerId: string; hue: 'green' | 'purple' | 'gold' | 'cyan' }>;
};

export type CollabPeer = {
  id: string;
  name: string;
  hue: 'green' | 'purple' | 'gold' | 'cyan';
  online: boolean;
  typing?: boolean;
  platform?: FeedPlatform;
};

export type CollabMobileTab = 'home' | 'channels' | 'chat' | 'settings';

export type CollabLayoutMode = 'feed' | 'repo' | 'settings';

export type ContextMenuAction = 'open' | 'share' | 'convert' | 'ask_agent';
