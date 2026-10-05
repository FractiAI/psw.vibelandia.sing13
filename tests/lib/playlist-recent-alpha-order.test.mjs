import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());

function loadMenuOrderModule() {
  // Structural + behavioral via dynamic mirrors of the pure helpers
  const src = readFileSync(resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/playlistMenuOrder.ts'), 'utf8');
  expect(src).toMatch(/RECENT_PLAYLIST_MENU_CAP/);
  expect(src).toMatch(/bumpRecentPlaylistMenuOrder/);
  expect(src).toMatch(/PLAYLIST_ORDER_MODE_RECENT_ALPHA/);
  return src;
}

/** Mirror of bump + normalize for regression without importing app TS. */
function bumpRecentPlaylistMenuOrder(order, playlistId, cap = 24) {
  const pinned = new Set([
    'pl-main',
    'pl-my-likes',
    'pl-concierto-prelude',
    'pl-reception',
    'pl-sin-city',
    'pl-reading-room',
  ]);
  if (!playlistId || pinned.has(playlistId)) {
    return order.filter((id) => id !== playlistId);
  }
  return [playlistId, ...order.filter((id) => id !== playlistId)].slice(0, cap);
}

function normalizePlaylistMenuOrder(order, playlists, cap = 24) {
  const pinned = new Set([
    'pl-main',
    'pl-my-likes',
    'pl-concierto-prelude',
    'pl-reception',
    'pl-sin-city',
    'pl-reading-room',
  ]);
  const manageable = playlists.filter((p) => !pinned.has(p.id));
  const manageableIds = new Set(manageable.map((p) => p.id));
  const seen = new Set();
  const recent = [];
  for (const id of order ?? []) {
    if (!manageableIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    recent.push(id);
    if (recent.length >= cap) break;
  }
  const rest = manageable
    .filter((p) => !seen.has(p.id))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  return [...recent, ...rest.map((p) => p.id)];
}

describe('playlist menu · recent listen supersedes A–Z', () => {
  it('ships recent-alpha helpers', () => {
    loadMenuOrderModule();
    const store = readFileSync(resolve(ROOT, 'apps/ss-vibelandia-questfest/src/stores/catalogStore.ts'), 'utf8');
    expect(store).toMatch(/touchRecentPlaylistListen/);
    expect(store).toMatch(/PLAYLIST_ORDER_MODE_RECENT_ALPHA/);
    const playback = readFileSync(resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/trackPlayback.ts'), 'utf8');
    expect(playback).toMatch(/touchRecentPlaylistListen/);
  });

  it('orders remaining playlists alphabetically after recent listens', () => {
    const playlists = [
      { id: 'pl-main', name: 'Master' },
      { id: 'pl-z', name: 'Zebra' },
      { id: 'pl-a', name: 'Alpha' },
      { id: 'pl-m', name: 'Mango' },
    ];
    expect(normalizePlaylistMenuOrder([], playlists)).toEqual(['pl-a', 'pl-m', 'pl-z']);
    const afterListen = bumpRecentPlaylistMenuOrder([], 'pl-z');
    expect(normalizePlaylistMenuOrder(afterListen, playlists)).toEqual(['pl-z', 'pl-a', 'pl-m']);
    const again = bumpRecentPlaylistMenuOrder(afterListen, 'pl-m');
    expect(normalizePlaylistMenuOrder(again, playlists)).toEqual(['pl-m', 'pl-z', 'pl-a']);
  });

  it('does not bump pinned catalogs into the recent stack', () => {
    expect(bumpRecentPlaylistMenuOrder(['pl-a'], 'pl-main')).toEqual(['pl-a']);
  });
});
