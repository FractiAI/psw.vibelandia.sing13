/**
 * Infinite Octaves · FractiSkills Goldilocks pilot
 *
 * Portable page skills (SKILL.md) as a companion corpus under the AI catalog layer.
 * Pointer-first: match ≤N skills, pinch ≤2 bodies — never fat-dump the library.
 *
 * Honesty: local repo render of selected surfaces — not a live whole-site crawl,
 * not a claim that Skillarum is embedded, not a sixth cruise door.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export const LATTICE_SKILLS_PILOT = Object.freeze({
  id: 'fractiskills-goldilocks-pilot',
  schemaVersion: 1,
  maxPointers: 5,
  maxPinches: 2,
  pinchChars: 1400,
  honesty:
    'Goldilocks FractiSkills pilot — curated local SKILL.md packages for Infinite Octaves Lattice Chat. Not a whole-site crawl and not a finished physics proof.',
});

const INDEX_REL = 'skills/index.json';

/**
 * @typedef {{ id: string, name: string, description: string, tags: string[], routes: string[], sources: string[], path: string, area?: string }} LatticeSkillRecord
 */

/** @param {string} root */
export function loadSkillsIndex(root = process.cwd()) {
  const abs = join(root, INDEX_REL);
  if (!existsSync(abs)) {
    return { schemaVersion: LATTICE_SKILLS_PILOT.schemaVersion, skills: [], honesty: LATTICE_SKILLS_PILOT.honesty };
  }
  try {
    const raw = JSON.parse(readFileSync(abs, 'utf8'));
    const skills = Array.isArray(raw.skills) ? raw.skills : [];
    return {
      schemaVersion: Number(raw.schemaVersion) || LATTICE_SKILLS_PILOT.schemaVersion,
      skills,
      honesty: String(raw.honesty || LATTICE_SKILLS_PILOT.honesty),
      generatedAt: raw.generatedAt || null,
    };
  } catch {
    return { schemaVersion: LATTICE_SKILLS_PILOT.schemaVersion, skills: [], honesty: LATTICE_SKILLS_PILOT.honesty };
  }
}

/** Scan skills/<area>/<id>/SKILL.md and build index records (for sync script). */
export function collectSkillsFromTree(root = process.cwd()) {
  const base = join(root, 'skills');
  /** @type {LatticeSkillRecord[]} */
  const out = [];
  if (!existsSync(base)) return out;

  for (const area of readdirSync(base)) {
    const areaPath = join(base, area);
    if (!statSync(areaPath).isDirectory()) continue;
    if (area.startsWith('.')) continue;

    for (const skillDir of readdirSync(areaPath)) {
      const skillPath = join(areaPath, skillDir);
      if (!statSync(skillPath).isDirectory()) continue;
      const mdPath = join(skillPath, 'SKILL.md');
      if (!existsSync(mdPath)) continue;
      const rel = `skills/${area}/${skillDir}/SKILL.md`;
      const parsed = parseSkillFrontmatter(readFileSync(mdPath, 'utf8'));
      out.push({
        id: parsed.id || skillDir,
        name: parsed.name || skillDir,
        description: parsed.description || '',
        tags: parsed.tags || [],
        routes: parsed.routes || [],
        sources: parsed.sources || [],
        path: rel,
        area,
      });
    }
  }

  out.sort((a, b) => a.id.localeCompare(b.id));
  return out;
}

/** @param {string} md */
export function parseSkillFrontmatter(md) {
  const m = String(md || '').match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const block = m[1];
  /** @type {Record<string, any>} */
  const out = {};
  for (const line of block.split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let val = kv[2].trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      out[key] = val
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } else {
      out[key] = val.replace(/^["']|["']$/g, '');
    }
  }
  if (typeof out.tags === 'string') out.tags = [out.tags];
  if (typeof out.routes === 'string') out.routes = [out.routes];
  if (typeof out.sources === 'string') out.sources = [out.sources];
  return out;
}

/**
 * Score skills against the ask. Returns ranked matches.
 * @param {string} message
 * @param {{ skills?: LatticeSkillRecord[] }} [index]
 */
export function matchSkills(message, index) {
  const skills = index?.skills || [];
  const text = String(message || '').toLowerCase();
  if (!text.trim() || !skills.length) return [];

  const scored = skills.map((s) => {
    let score = 0;
    const hay = [
      s.id,
      s.name,
      s.description,
      ...(s.tags || []),
      ...(s.routes || []),
      ...(s.sources || []),
      s.area || '',
    ]
      .join(' ')
      .toLowerCase();

    for (const tag of s.tags || []) {
      const t = String(tag).toLowerCase();
      if (t && text.includes(t)) score += 3;
    }
    for (const route of s.routes || []) {
      const r = String(route).toLowerCase().replace(/^\//, '');
      if (r && text.includes(r)) score += 4;
    }
    // Token overlap on name/id words
    for (const tok of String(s.id).split(/[-_]/).filter((w) => w.length > 3)) {
      if (text.includes(tok)) score += 2;
    }
    if (/skill|fractiskill|portable.?skill|skill\.md/.test(text) && /skill|corpus|catalog/.test(hay)) {
      score += 2;
    }
    if (/lattice.?chat|\/lattice|token.?max/.test(text) && /lattice/.test(hay)) score += 2;
    if (/prospectus|voyage|frontiersman|cruise.?door/.test(text) && /prospectus|voyage/.test(hay)) {
      score += 3;
    }
    if (/catalog.?layer|ai.?stack|resonant.?data/.test(text) && /catalog|ai-stack/.test(hay)) {
      score += 3;
    }
    if (/ship-?blog|latest.?six|questfest/.test(text) && /ship-blog|questfest/.test(hay)) score += 2;
    if (/nspfrnp|mca|seed:?edge/.test(text) && /nspfrnp|mca|seed/.test(hay)) score += 2;
    if (/honest|goldilocks|valet/.test(text) && /honesty|goldilocks|valet/.test(hay)) score += 1;
    return { skill: s, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.skill.id.localeCompare(b.skill.id))
    .map((x) => x.skill);
}

function readSkillPinch(relPath, root, maxChars) {
  try {
    const abs = join(root, relPath);
    if (!existsSync(abs)) return null;
    const text = readFileSync(abs, 'utf8').slice(0, maxChars);
    return { path: relPath, text };
  } catch {
    return null;
  }
}

/**
 * Build prompt clause: compact pointer list + ≤2 pinches.
 * Skipped for nest=none / non-complex unless force.
 *
 * @param {object} opts
 * @param {string} opts.message
 * @param {boolean} [opts.complex]
 * @param {string} [opts.nestTopology]
 * @param {string} [opts.root]
 */
export function buildLatticeSkillsPack({
  message,
  complex = false,
  nestTopology = 'octave99',
  root = process.cwd(),
} = {}) {
  if (nestTopology === 'none' || nestTopology === 'plain' || nestTopology === 'direct') {
    return '';
  }
  // Complex asks get skills; strong skill-keyword asks also get a light pack.
  const force =
    /fractiskill|skill\.md|portable.?skill|skills\/index|whole.?site.?skill/.test(
      String(message || '').toLowerCase(),
    );
  if (!complex && !force) return '';

  const index = loadSkillsIndex(root);
  if (!index.skills.length) return '';

  const matched = matchSkills(message, index);
  // Soft fallback: on complex octave99, still surface top catalog/lattice pointers
  const picks =
    matched.length > 0
      ? matched
      : index.skills.filter((s) =>
          /lattice|catalog|prospectus|seed-rag|honesty/.test(
            `${s.id} ${(s.tags || []).join(' ')}`,
          ),
        );

  if (!picks.length) return '';

  const pointers = picks.slice(0, LATTICE_SKILLS_PILOT.maxPointers);
  const pinchTargets = pointers.slice(0, LATTICE_SKILLS_PILOT.maxPinches);
  const pinches = pinchTargets
    .map((s) => readSkillPinch(s.path, root, LATTICE_SKILLS_PILOT.pinchChars))
    .filter(Boolean);

  const lines = [
    `## FractiSkills pilot (pointer-first)`,
    LATTICE_SKILLS_PILOT.honesty,
    `Matched skills (load these paths — do not invent skills):`,
    ...pointers.map(
      (s) =>
        `- \`${s.path}\` · ${s.name}${s.routes?.length ? ` · routes: ${s.routes.join(', ')}` : ''}`,
    ),
  ];

  if (pinches.length) {
    lines.push('', `### Skill pinches (≤${LATTICE_SKILLS_PILOT.maxPinches})`);
    for (const p of pinches) {
      lines.push('', `#### ${p.path}`, '```', p.text.trim(), '```');
    }
  }

  lines.push(
    '',
    'Procedure: use skill pointers before fat HTML/docs dumps; prefer Seed pack + skills over repo tours.',
  );

  return lines.join('\n');
}
