/**
 * Lattice Chat · curated repositories / workstream catalog.
 * Guests may select any guestSelectable entry; Cursor live list may extend availability.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CATALOG_PATH = join(__dirname, '..', 'data', 'lattice-repositories.json');

/** @typedef {{ id: string, name: string, label: string, url: string, startingRef?: string, blurb?: string, tags?: string[], guestSelectable?: boolean }} LatticeRepo */

let cached = null;

export function loadLatticeRepositoriesCatalog() {
  if (cached) return cached;
  const raw = JSON.parse(readFileSync(CATALOG_PATH, 'utf8'));
  const repositories = Array.isArray(raw.repositories) ? raw.repositories : [];
  cached = {
    schema: raw.schema || 'lattice-repositories/v1',
    updatedAt: raw.updatedAt || null,
    defaultId: raw.defaultId || repositories[0]?.id || 'sing13',
    repositories,
  };
  return cached;
}

export function listGuestRepositories() {
  const cat = loadLatticeRepositoriesCatalog();
  return cat.repositories.filter((r) => r.guestSelectable !== false);
}

export function findLatticeRepository(idOrUrl) {
  const cat = loadLatticeRepositoriesCatalog();
  const needle = String(idOrUrl || '').trim().toLowerCase();
  if (!needle) return null;
  return (
    cat.repositories.find((r) => r.id.toLowerCase() === needle) ||
    cat.repositories.find((r) => r.url.toLowerCase() === needle) ||
    cat.repositories.find((r) => r.name.toLowerCase() === needle) ||
    cat.repositories.find((r) => needle.includes(r.name.toLowerCase())) ||
    null
  );
}

/**
 * Resolve client-requested repo against curated allowlist (+ optional live Cursor URLs).
 * @returns {{ ok: true, repo: LatticeRepo } | { ok: false, error: string, code: string }}
 */
export function resolveLatticeRepoSelection(requested, liveUrls = []) {
  const cat = loadLatticeRepositoriesCatalog();
  const defaultRepo =
    cat.repositories.find((r) => r.id === cat.defaultId) || cat.repositories[0];
  if (!requested) {
    return { ok: true, repo: defaultRepo };
  }
  const found = findLatticeRepository(requested);
  if (found) {
    if (found.guestSelectable === false) {
      return {
        ok: false,
        error: 'This repository is not available for guest workstreams.',
        code: 'repo_not_guest_selectable',
      };
    }
    return { ok: true, repo: found };
  }
  const req = String(requested).trim().toLowerCase();
  const liveHit = (liveUrls || []).find((u) => {
    const uLow = String(u || '').toLowerCase();
    return uLow === req || uLow.includes(req) || req.includes(uLow);
  });
  if (liveHit) {
    const name = String(liveHit).replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
    return {
      ok: true,
      repo: {
        id: `live-${name.replace(/[^a-z0-9_-]+/gi, '-')}`,
        name,
        label: name,
        url: liveHit.startsWith('http') ? liveHit : `https://github.com/${name}`,
        startingRef: 'main',
        blurb: 'Connected via your Cursor GitHub integration.',
        tags: ['live'],
        guestSelectable: true,
      },
    };
  }
  return {
    ok: false,
    error: 'Repository not in the Lattice available list.',
    code: 'repo_not_allowlisted',
  };
}
