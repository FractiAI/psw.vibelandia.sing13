import type { PlaylistDef, TrackDef } from '@/lib/catalogTypes';
import { buildTrackListenUrl, buildTrackShareText } from '@/lib/shareTrack';
import type { ForwardRecipient } from '@/lib/forwardRecipients';
import { recipientsWithEmail, recipientsWithPhone } from '@/lib/forwardRecipients';

export type ForwardTarget =
  | { kind: 'track'; track: TrackDef }
  | { kind: 'playlist'; playlist: PlaylistDef };

export function buildPlaylistListenUrl(playlistId: string, opts?: { autoplay?: boolean }): string {
  const q = new URLSearchParams();
  q.set('playlist', playlistId);
  if (opts?.autoplay) q.set('autoplay', '1');
  if (typeof window === 'undefined') {
    return `https://www.ssvibelandiaquestfest24x365.com/interfaces/questfest-bridge/#/listen?${q.toString()}`;
  }
  const { origin, pathname } = window.location;
  return `${origin}${pathname}#/listen?${q.toString()}`;
}

export function buildPlaylistShareText(playlist: PlaylistDef): string {
  const count = playlist.trackIds.length;
  const songs = count === 1 ? '1 song' : `${count} songs`;
  return `${playlist.name} · ${songs} — SS Vibelandia QUESTFEST`;
}

export function buildForwardUrl(target: ForwardTarget): string {
  return target.kind === 'track'
    ? buildTrackListenUrl(target.track.id)
    : buildPlaylistListenUrl(target.playlist.id);
}

export function buildForwardHeadline(target: ForwardTarget): string {
  return target.kind === 'track'
    ? buildTrackShareText(target.track)
    : buildPlaylistShareText(target.playlist);
}

export function buildForwardMessage(target: ForwardTarget): string {
  return `${buildForwardHeadline(target)}\n${buildForwardUrl(target)}`;
}

export type ForwardSendResult = 'opened' | 'copied' | 'failed' | 'noop';

export async function copyForwardMessage(target: ForwardTarget): Promise<ForwardSendResult> {
  const text = buildForwardMessage(target);
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}

export function openForwardEmail(
  target: ForwardTarget,
  selected: ForwardRecipient[],
): ForwardSendResult {
  const withEmail = recipientsWithEmail(selected);
  if (!withEmail.length) return 'noop';
  const to = withEmail.map((r) => r.email!).join(',');
  const subject =
    target.kind === 'track'
      ? `Listen: ${target.track.title}`
      : `Playlist: ${target.playlist.name}`;
  const body = buildForwardMessage(target);
  // mailto:to1,to2 — keep commas literal (do not encodeURIComponent the address list)
  window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return 'opened';
}

export function openForwardSms(
  target: ForwardTarget,
  selected: ForwardRecipient[],
): ForwardSendResult {
  const withPhone = recipientsWithPhone(selected);
  if (!withPhone.length) return 'noop';
  const body = buildForwardMessage(target);
  const phones = withPhone.map((r) => r.phone!).join(',');
  // iOS multi-recipient: sms:/open?addresses=… ; Android often takes sms:phone
  const isIOS =
    typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as Window & { MSStream?: unknown }).MSStream;
  const href = isIOS
    ? `sms:/open?addresses=${encodeURIComponent(phones)}&body=${encodeURIComponent(body)}`
    : `sms:${phones}?body=${encodeURIComponent(body)}`;
  window.location.href = href;
  return 'opened';
}

export async function nativeForwardShare(target: ForwardTarget): Promise<ForwardSendResult> {
  const url = buildForwardUrl(target);
  const text = buildForwardHeadline(target);
  const title =
    target.kind === 'track' ? target.track.title : target.playlist.name;
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'opened';
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return 'noop';
    }
  }
  return copyForwardMessage(target);
}
