/**
 * Valet Pru's Doodles · three nested shells (Omniversal Canvas exhibit grammar).
 * Dome 1 Core · Dome 2 Amphitheater · Dome 3 Horizon — same ids as lib/exhibit-shells.mjs.
 *
 * Honesty: catalog filing for the gallery wall — not an art-market valuation or proof of physics.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const DOODLE_SHELL_IDS = Object.freeze(['core', 'amphitheater', 'horizon']);

export const DOODLE_SHELLS = Object.freeze([
  {
    id: 'core',
    label: 'Dome 1 · Core',
    title: 'Holographic Convergence Core',
    href: '/core',
    lede:
      'Inner worlds on the wall — imagination filed as holographic reality: light-body, mythic figures, and the dark audio core.',
  },
  {
    id: 'amphitheater',
    label: 'Dome 2 · Amphitheater',
    title: 'Goldilocks Amphitheater',
    href: '/amphitheater',
    lede:
      'The set and daily life now — cast portraits, tables, animals, beaches, and the rooms you walk through today.',
  },
  {
    id: 'horizon',
    label: 'Dome 3 · Horizon',
    title: 'Omni-Horizon',
    href: '/horizon',
    lede:
      'Studio, canvas, and materials — desks, diagrams, nested maps, and awareness navigation sketches.',
  },
]);

export const DOODLE_SHELL_DEFAULT = 'amphitheater';

let cachedMap = null;

function mapPath() {
  return join(dirname(fileURLToPath(import.meta.url)), '../data/doodles-shell-map.json');
}

/**
 * Load filename/id → shell catalog map (git-grounded filing for live Blob works).
 */
export function loadDoodleShellMap() {
  if (cachedMap) return cachedMap;
  try {
    const raw = JSON.parse(readFileSync(mapPath(), 'utf8'));
    cachedMap = {
      version: Number(raw.version) || 1,
      byFilename: raw.byFilename && typeof raw.byFilename === 'object' ? raw.byFilename : {},
      byId: raw.byId && typeof raw.byId === 'object' ? raw.byId : {},
    };
  } catch {
    cachedMap = { version: 1, byFilename: {}, byId: {} };
  }
  return cachedMap;
}

/** Test helper — clear cached map. */
export function clearDoodleShellMapCache() {
  cachedMap = null;
}

export function isDoodleShellId(value) {
  return DOODLE_SHELL_IDS.includes(String(value || ''));
}

export function normalizeDoodleShell(value) {
  const id = String(value || '')
    .trim()
    .toLowerCase();
  return isDoodleShellId(id) ? id : null;
}

function stemFilename(filename) {
  return String(filename || '')
    .replace(/\.[^.]+$/, '')
    .trim();
}

/**
 * Resolve shell for a work: explicit field → byId map → byFilename map → default.
 */
export function resolveDoodleShell(work, map = loadDoodleShellMap()) {
  const explicit = normalizeDoodleShell(work?.shell);
  if (explicit) return explicit;

  const id = String(work?.id || '');
  if (id && map.byId?.[id] && isDoodleShellId(map.byId[id])) {
    return map.byId[id];
  }

  const stem = stemFilename(work?.filename || work?.title || '');
  if (stem && map.byFilename?.[stem] && isDoodleShellId(map.byFilename[stem])) {
    return map.byFilename[stem];
  }

  return DOODLE_SHELL_DEFAULT;
}

/**
 * Attach resolved `shell` onto each work (does not mutate input array items in place).
 */
export function applyDoodleShells(manifest, map = loadDoodleShellMap()) {
  const works = Array.isArray(manifest?.works) ? manifest.works : [];
  return {
    ...manifest,
    works: works.map((w) => ({
      ...w,
      shell: resolveDoodleShell(w, map),
    })),
  };
}

/**
 * Group works into nested-shell order (Core → Amphitheater → Horizon),
 * preserving relative order within each shell.
 */
export function groupDoodlesByShell(works, map = loadDoodleShellMap()) {
  const buckets = {
    core: [],
    amphitheater: [],
    horizon: [],
  };
  for (const work of works || []) {
    const shell = resolveDoodleShell(work, map);
    buckets[shell].push({ ...work, shell });
  }
  return DOODLE_SHELLS.map((meta) => ({
    ...meta,
    works: buckets[meta.id],
    count: buckets[meta.id].length,
  }));
}

/**
 * Assign shells onto a manifest (Player 1 curate).
 * @param {object} manifest
 * @param {Array<{ id: string, shell: string }>} assignments
 */
export function assignDoodleShells(manifest, assignments) {
  const list = Array.isArray(assignments) ? assignments : [];
  const byId = new Map();
  for (const row of list) {
    const id = String(row?.id || '')
      .replace(/[^\w-]/g, '')
      .slice(0, 80);
    const shell = normalizeDoodleShell(row?.shell);
    if (!id || !shell) continue;
    byId.set(id, shell);
  }

  const works = Array.isArray(manifest?.works) ? manifest.works : [];
  const nextWorks = works.map((w) => {
    if (!byId.has(w.id)) return w;
    return { ...w, shell: byId.get(w.id) };
  });

  return {
    version: Math.max(Number(manifest?.version) || 1, 1) + 1,
    updatedAt: new Date().toISOString(),
    works: nextWorks,
  };
}
