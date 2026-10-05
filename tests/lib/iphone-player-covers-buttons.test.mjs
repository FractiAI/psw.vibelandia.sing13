import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const ROUTES = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/lib/jukeboxRoutes.ts');
const PLAYER = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/components/player/BridgePlayer.tsx');
const CSS = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/styles/global.css');

describe('iPhone jukebox player does not cover page buttons', () => {
  it('keeps compact chrome on /listen and /listen/now (no cover-in-bar on now)', () => {
    const routes = readFileSync(ROUTES, 'utf8');
    expect(routes).toMatch(/export function isJukeboxListenPath/);
    const player = readFileSync(PLAYER, 'utf8');
    expect(player).toMatch(/isJukeboxListenPath\(pathname\)/);
    expect(player).toMatch(/jukeboxChrome/);
    expect(player).toMatch(/!jukeboxChrome && coverUrl/);
  });

  it('clears the dock with ≥6.25rem padding including now page override', () => {
    const css = readFileSync(CSS, 'utf8');
    expect(css).toMatch(/padding-bottom: calc\(6\.25rem \+ env\(safe-area-inset-bottom/);
    expect(css).toMatch(/html\.qf-jukebox-page \.jb-app--now/);
    expect(css).not.toMatch(
      /html\.qf-jukebox-page \.jb-app \{\s*padding-bottom: calc\(3\.85rem/,
    );
  });

  it('keeps compact control hit targets so the bar does not wrap over content', () => {
    const css = readFileSync(CSS, 'utf8');
    expect(css).toMatch(
      /sp-bridge-player--jukebox \.sp-now-btn[\s\S]*?min-height: 2rem/,
    );
    expect(css).toMatch(/sp-bridge-player--jukebox \.sp-now-controls[\s\S]*?flex-wrap: nowrap/);
  });
});
