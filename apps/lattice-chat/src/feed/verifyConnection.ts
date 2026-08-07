import type { IntegrationId } from '@/feed/types';

export type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'error';

export type VerifyResult = {
  ok: boolean;
  status: ConnectionStatus;
  message: string;
  hint?: string;
  resolvedLabel?: string;
};

function trimLabel(raw: string): string {
  return raw.trim().replace(/^@/, '');
}

/** Probe Lattice Collaborate feed pipe (always available). */
async function probeFeedPipe(): Promise<{ ok: boolean; detail: string }> {
  try {
    const res = await fetch('/api/lattice-collaborate-feed', {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      return { ok: false, detail: `Feed pipe returned HTTP ${res.status}.` };
    }
    const data = (await res.json()) as { ok?: boolean };
    if (!data?.ok) {
      return { ok: false, detail: 'Feed pipe responded but was not healthy.' };
    }
    return { ok: true, detail: 'Feed pipe reachable.' };
  } catch {
    return {
      ok: false,
      detail: 'Could not reach /api/lattice-collaborate-feed — check network or try again.',
    };
  }
}

async function verifyGithub(accountLabel: string): Promise<VerifyResult> {
  const label = trimLabel(accountLabel);
  if (!label) {
    return {
      ok: false,
      status: 'error',
      message: 'Enter a GitHub user or owner/repo.',
      hint: 'Examples: FractiAI  or  FractiAI/psw.vibelandia.sing13',
    };
  }
  if (!/^[A-Za-z0-9_.-]+(\/[A-Za-z0-9_.-]+)?$/.test(label)) {
    return {
      ok: false,
      status: 'error',
      message: 'That GitHub label looks wrong.',
      hint: 'Use letters, numbers, ., _, - — and at most one slash (owner/repo).',
    };
  }

  const isRepo = label.includes('/');
  const url = isRepo
    ? `https://api.github.com/repos/${label}`
    : `https://api.github.com/users/${label}`;

  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (res.status === 404) {
      return {
        ok: false,
        status: 'error',
        message: isRepo ? `Repo “${label}” was not found.` : `User “${label}” was not found.`,
        hint: isRepo
          ? 'Check owner/repo spelling, or confirm the repo is public.'
          : 'Check the username spelling and try again.',
      };
    }
    if (res.status === 403) {
      return {
        ok: false,
        status: 'error',
        message: 'GitHub rate-limited this check.',
        hint: 'Wait a minute and try again, or use a different public repo.',
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: 'error',
        message: `GitHub returned HTTP ${res.status}.`,
        hint: 'Correct the label and tap Connect again.',
      };
    }
    const data = (await res.json()) as { full_name?: string; login?: string; html_url?: string };
    const resolved = data.full_name || data.login || label;
    return {
      ok: true,
      status: 'connected',
      message: `Connected to ${resolved}`,
      resolvedLabel: resolved,
      hint: data.html_url,
    };
  } catch {
    return {
      ok: false,
      status: 'error',
      message: 'Could not reach GitHub.',
      hint: 'Check your connection, then correct the label if needed.',
    };
  }
}

async function verifyGitlab(accountLabel: string): Promise<VerifyResult> {
  const label = trimLabel(accountLabel).replace(/^https?:\/\/gitlab\.com\//i, '').replace(/\.git$/, '');
  if (!label) {
    return {
      ok: false,
      status: 'error',
      message: 'Enter a GitLab path (group/project).',
      hint: 'Example: group/my-project',
    };
  }
  if (!/^[A-Za-z0-9_.\-]+(\/[A-Za-z0-9_.\-]+)+$/.test(label)) {
    return {
      ok: false,
      status: 'error',
      message: 'That GitLab path looks incomplete.',
      hint: 'Use group/project (at least one slash).',
    };
  }

  const url = `https://gitlab.com/api/v4/projects/${encodeURIComponent(label)}`;
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.status === 404) {
      return {
        ok: false,
        status: 'error',
        message: `Project “${label}” was not found.`,
        hint: 'Check the path, or confirm the project is public on gitlab.com.',
      };
    }
    if (!res.ok) {
      return {
        ok: false,
        status: 'error',
        message: `GitLab returned HTTP ${res.status}.`,
        hint: 'Correct the path and tap Connect again.',
      };
    }
    const data = (await res.json()) as { path_with_namespace?: string; web_url?: string };
    const resolved = data.path_with_namespace || label;
    return {
      ok: true,
      status: 'connected',
      message: `Connected to ${resolved}`,
      resolvedLabel: resolved,
      hint: data.web_url,
    };
  } catch {
    return {
      ok: false,
      status: 'error',
      message: 'Could not reach GitLab.',
      hint: 'Check your connection, then correct the path if needed.',
    };
  }
}

function verifyWhatsappFormat(accountLabel: string): VerifyResult {
  const raw = accountLabel.trim();
  if (!raw) {
    return {
      ok: false,
      status: 'error',
      message: 'Enter a WhatsApp number or business label.',
      hint: 'Example: +15551234567  or  Vibelandia Desk',
    };
  }
  const digits = raw.replace(/[^\d]/g, '');
  const looksPhone = raw.startsWith('+') || digits.length >= 8;
  if (looksPhone && (digits.length < 8 || digits.length > 15)) {
    return {
      ok: false,
      status: 'error',
      message: 'That phone number length looks wrong.',
      hint: 'Use E.164 style: + and 8–15 digits (example +15551234567).',
    };
  }
  if (!looksPhone && raw.length < 2) {
    return {
      ok: false,
      status: 'error',
      message: 'Label is too short.',
      hint: 'Enter a display name (2+ characters) or a full phone number.',
    };
  }
  return {
    ok: true,
    status: 'connected',
    message: `WhatsApp label set: ${raw}`,
    resolvedLabel: raw,
  };
}

function verifyFacebookFormat(accountLabel: string): VerifyResult {
  const raw = accountLabel.trim();
  if (!raw) {
    return {
      ok: false,
      status: 'error',
      message: 'Enter a Facebook Page name or URL.',
      hint: 'Example: SSVibelandia  or  https://facebook.com/YourPage',
    };
  }
  let page = raw
    .replace(/^https?:\/\/(www\.)?facebook\.com\//i, '')
    .replace(/\/$/, '')
    .split(/[?#]/)[0];
  if (page.includes('/')) page = page.split('/').filter(Boolean).pop() || page;
  if (!/^[A-Za-z0-9.]+$/.test(page) || page.length < 2) {
    return {
      ok: false,
      status: 'error',
      message: 'That Facebook Page id looks wrong.',
      hint: 'Use the page username (letters, numbers, dots) or paste the facebook.com URL.',
    };
  }
  return {
    ok: true,
    status: 'connected',
    message: `Facebook Page set: ${page}`,
    resolvedLabel: page,
  };
}

/**
 * Confirm guest-entered integration info before enabling the feed.
 * GitHub/GitLab hit public APIs; WhatsApp/Facebook validate format + feed pipe.
 */
export async function verifyIntegration(
  id: IntegrationId,
  accountLabel: string,
): Promise<VerifyResult> {
  if (id === 'github') return verifyGithub(accountLabel);
  if (id === 'gitlab') return verifyGitlab(accountLabel);

  const format =
    id === 'whatsapp' ? verifyWhatsappFormat(accountLabel) : verifyFacebookFormat(accountLabel);
  if (!format.ok) return format;

  const pipe = await probeFeedPipe();
  if (!pipe.ok) {
    return {
      ok: false,
      status: 'error',
      message: pipe.detail,
      hint: 'Label looks fine — fix connectivity, then Connect again.',
    };
  }

  return {
    ...format,
    message: `${format.message} · ${pipe.detail}`,
  };
}

export function placeholderFor(id: IntegrationId): string {
  if (id === 'github') return 'owner or owner/repo';
  if (id === 'gitlab') return 'group/project';
  if (id === 'whatsapp') return '+15551234567 or desk name';
  return 'Page name or facebook.com/…';
}

export function displayName(id: IntegrationId): string {
  if (id === 'facebook') return 'Facebook';
  if (id === 'whatsapp') return 'WhatsApp';
  if (id === 'github') return 'GitHub';
  return 'GitLab';
}
