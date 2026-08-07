import { sanitizePayload } from '@/feed/sanitize';
import type {
  ArtifactPayload,
  FeedPlatform,
  GitPayload,
  MessagingPayload,
  SocialPayload,
  UnifiedFeedItem,
} from '@/feed/types';

function uid(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

type RawEnvelope = {
  type?: string;
  platform?: string;
  actor?: string;
  createdAt?: string;
  body?: string;
  presenceHue?: UnifiedFeedItem['presenceHue'];
  threadPeerId?: string;
  threadId?: string;
  git?: GitPayload;
  social?: SocialPayload;
  messaging?: MessagingPayload;
  artifact?: ArtifactPayload;
  // loose webhook shapes
  repository?: { full_name?: string; name?: string };
  commits?: unknown[];
  pusher?: { name?: string };
  pull_request?: { title?: string; merged?: boolean; user?: { login?: string }; html_url?: string };
  ref?: string;
  compare?: string;
  message?: string;
  from?: string;
  text?: string;
  title?: string;
  url?: string;
  author?: string;
  path?: string;
  kind?: string;
};

function asPlatform(p?: string): FeedPlatform {
  const n = (p || '').toLowerCase();
  if (n === 'github' || n === 'gitlab' || n === 'facebook' || n === 'whatsapp') return n;
  return 'lattice';
}

/** Centralized webhook / payload parser → UnifiedFeedItem */
export function parseIncomingPayload(raw: unknown): UnifiedFeedItem | null {
  const data = sanitizePayload<RawEnvelope>(raw);
  if (!data || typeof data !== 'object') return null;

  const type = (data.type || '').toLowerCase();
  const createdAt = data.createdAt || new Date().toISOString();

  if (type === 'socialpost' || type === 'social_post' || data.social) {
    const social = data.social || {
      network: 'facebook' as const,
      author: data.author || data.actor || 'Page',
      title: data.title || data.body || 'Social update',
      body: data.body,
      url: data.url,
    };
    return {
      id: uid('social'),
      kind: 'social_post',
      platform: asPlatform(data.platform) || 'facebook',
      createdAt,
      actor: social.author,
      sourceLabel: social.network === 'facebook' ? 'Facebook' : 'Social',
      body: social.body,
      social,
      presenceHue: data.presenceHue,
    };
  }

  if (type === 'messagingevent' || type === 'messaging' || data.messaging) {
    const messaging = data.messaging || {
      network: 'whatsapp' as const,
      from: data.from || data.actor || 'Contact',
      body: data.message || data.text || data.body || '',
    };
    return {
      id: uid('msg'),
      kind: 'messaging',
      platform: asPlatform(data.platform) || 'whatsapp',
      createdAt,
      actor: messaging.from,
      sourceLabel: messaging.network === 'whatsapp' ? 'WhatsApp' : 'Message',
      body: messaging.body,
      messaging,
      presenceHue: data.presenceHue || 'green',
    };
  }

  if (type === 'gitevent' || type === 'git_event' || data.git || data.commits || data.pull_request) {
    const repo =
      data.git?.repo ||
      data.repository?.full_name ||
      data.repository?.name ||
      'repo';
    let action = data.git?.action || 'push';
    if (data.pull_request?.merged) action = 'merge';
    else if (data.pull_request) action = 'pr';
    else if (Array.isArray(data.commits) && data.commits.length) action = 'push';

    const commitCount = data.git?.commitCount ?? (Array.isArray(data.commits) ? data.commits.length : undefined);
    const author = data.git?.author || data.pusher?.name || data.pull_request?.user?.login || data.actor;
    const summary =
      data.git?.summary ||
      data.pull_request?.title ||
      (commitCount
        ? `${commitCount} new commit${commitCount === 1 ? '' : 's'} pushed${author ? ` by ${author}` : ''}`
        : data.body || 'Repository activity');

    const git: GitPayload = {
      action: action as GitPayload['action'],
      repo,
      branch: data.git?.branch || (typeof data.ref === 'string' ? data.ref.replace(/^refs\/heads\//, '') : undefined),
      author,
      commitCount,
      summary,
      compareUrl: data.git?.compareUrl || data.compare || data.pull_request?.html_url,
      sha: data.git?.sha,
    };

    return {
      id: uid('git'),
      kind: 'git_event',
      platform: asPlatform(data.platform) || 'github',
      createdAt,
      actor: author || 'Automated',
      sourceLabel: 'Automated',
      body: summary,
      git,
      presenceHue: data.presenceHue,
    };
  }

  if (type === 'artifactevent' || type === 'artifact' || data.artifact) {
    const artifact = data.artifact || {
      title: data.title || 'Upload',
      kind: (data.kind as ArtifactPayload['kind']) || 'other',
      path: data.path,
      url: data.url,
    };
    return {
      id: uid('art'),
      kind: 'artifact',
      platform: asPlatform(data.platform) || 'lattice',
      createdAt,
      actor: data.actor || 'Lattice',
      sourceLabel: 'Artifact',
      body: artifact.title,
      artifact,
      presenceHue: data.presenceHue,
    };
  }

  // Default: chat / lattice native
  if (data.body || data.message || data.text) {
    return {
      id: uid('chat'),
      kind: 'chat',
      platform: asPlatform(data.platform) || 'lattice',
      createdAt,
      actor: data.actor || 'Peer',
      sourceLabel: 'Lattice',
      body: data.body || data.message || data.text,
      threadPeerId: data.threadPeerId || data.threadId || data.messaging?.threadId,
      presenceHue: data.presenceHue || 'purple',
    };
  }

  return null;
}
