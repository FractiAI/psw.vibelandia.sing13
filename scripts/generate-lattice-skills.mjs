#!/usr/bin/env node
/**
 * FractiSkills full local corpus — discover → render → index
 *
 * Builds SKILL.md packages from LOCAL registries only (no live crawl):
 *   Papers/      ← WHITEPAPER_REGISTRY
 *   Ship-Posts/  ← QUESTFEST_BLOG_POSTS
 *   Protocols/   ← protocols/*.md
 *   Research/    ← research/synthobs-* suites
 *   Interfaces/  ← major guest surfaces
 *
 * Preserves hand-curated Lattice/ + Core/ + Ship-Blog/ meta skills.
 * Then rebuilds skills/index.json via sync-lattice-skills-index.mjs.
 *
 * Honesty: local catalog render — not a live public crawl of 405 pages,
 * not an unfinished physics proof.
 */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  readdirSync,
  statSync,
  rmSync,
} from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { WHITEPAPER_REGISTRY, whitepaperHref } from '../lib/whitepaper-registry.mjs';
import { QUESTFEST_BLOG_POSTS } from '../lib/questfest-blog-posts.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Areas the generator owns (wiped + rewritten each run). Curated areas left intact. */
const GENERATED_AREAS = ['Papers', 'Ship-Posts', 'Protocols', 'Research', 'Interfaces'];

const MAJOR_INTERFACES = [
  {
    id: 'omniverse-canvas-front-door',
    name: 'Omniversal Canvas · site front door',
    description: 'Art / Canvas welcome surface — Valet Pru night-job first door.',
    tags: ['canvas', 'front-door', 'art', 'omniverse'],
    routes: ['/', '/art', '/omniverse-canvas'],
    sources: ['interfaces/omniverse-canvas.html'],
  },
  {
    id: 'questfest-ship-board',
    name: 'QUESTFEST · ship board',
    description: '24×365 ship board — latest ship-blog six, doors, fest pulse.',
    tags: ['questfest', 'ship-board', 'ship-blog'],
    routes: ['/questfest'],
    sources: ['interfaces/vibelandia-questfest.html'],
  },
  {
    id: 'lattice-chat-spa',
    name: 'Lattice Chat SPA',
    description: 'Infinite Octaves Omniversal Lattice Chat agent UI.',
    tags: ['lattice-chat', 'byok', 'agent'],
    routes: ['/lattice-chat'],
    sources: ['apps/lattice-chat/', 'interfaces/lattice-chat/index.html'],
  },
  {
    id: 'lattice-landing',
    name: 'Lattice landing · catalog layer',
    description: 'Product landing for Infinite Octaves Lattice Chat.',
    tags: ['lattice', 'catalog-layer', 'product'],
    routes: ['/lattice', '/lattice-v1618'],
    sources: ['interfaces/lattice-v1618.html'],
  },
  {
    id: 'lattice-how',
    name: 'Lattice · How it works',
    description: 'Deep primer / how Lattice Chat Agent works.',
    tags: ['lattice', 'how', 'primer'],
    routes: ['/lattice/how', '/lattice-learn-more'],
    sources: ['interfaces/lattice-learn-more.html'],
  },
  {
    id: 'synthio-sandbox',
    name: 'Synthio · Syntheverse Sandbox',
    description: 'Creator-only MRI / cloud-antenna sandbox — not engine pin.',
    tags: ['synthio', 'sandbox', 'mri'],
    routes: ['/synthio', '/synthio-one-pager'],
    sources: ['AGENT_SYNC_SYNTHIO.md'],
  },
  {
    id: 'reading-room',
    name: 'Reading Room · paper library',
    description: 'Library door for whitepapers and catalog shelves.',
    tags: ['reading-room', 'library', 'papers'],
    routes: ['/reading-room', '/papers'],
    sources: ['interfaces/reading-room.html'],
  },
  {
    id: 'journey-voyage',
    name: 'Journey · voyage door',
    description: 'Official Prospectus voyage door — Genesis · Borikén · Reno arc.',
    tags: ['journey', 'voyage', 'prospectus'],
    routes: ['/journey', '/frontiersman-voyage'],
    sources: ['interfaces/journeys.html'],
  },
  {
    id: 'creator-studio',
    name: 'Creator Studio door',
    description: 'Creator Studio cruise door for makers.',
    tags: ['creator-studio', 'doors'],
    routes: ['/creator-studio'],
    sources: ['interfaces/creator-studio.html'],
  },
  {
    id: 'jukebox-door',
    name: 'Jukebox · Sovereign Player',
    description: 'Music / jukebox cruise door.',
    tags: ['jukebox', 'music', 'doors'],
    routes: ['/jukebox', '/questfest-bridge'],
    sources: ['interfaces/questfest-bridge/'],
  },
  {
    id: 'pdvsa-gateway-ops',
    name: 'PDVSA gateway ops · special project',
    description: 'Enterprise gateway application companion — not engine pin.',
    tags: ['pdvsa', 'gateway', 'special-projects'],
    routes: ['/special-projects/pdvsa-gateway-ops'],
    sources: ['docs/SYNTHOBS_PDVSA_GATEWAY_OPS_MOCKUP_2026-09.md'],
  },
  {
    id: 'ai-transparency',
    name: 'AI transparency',
    description: 'Guest-facing AI Act / transparency notice.',
    tags: ['ai-transparency', 'honesty', 'guest'],
    routes: ['/ai-transparency'],
    sources: ['interfaces/ai-transparency.html'],
  },
  {
    id: 'ss-vibelandia-deck',
    name: 'SS Vibelandia deck',
    description: 'Ship identity / deck surface for SS Vibelandia.',
    tags: ['ss-vibelandia', 'deck', 'voyage'],
    routes: ['/ss-vibelandia'],
    sources: ['interfaces/ss-vibelandia.html'],
  },
];

function yamlList(arr) {
  return `[${(arr || []).map((s) => JSON.stringify(String(s))).join(', ')}]`;
}

function slugify(id) {
  return String(id)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
}

function writeSkill(area, id, fm, body) {
  const dir = join(root, 'skills', area, id);
  mkdirSync(dir, { recursive: true });
  const md = `---
id: ${fm.id}
name: ${JSON.stringify(fm.name)}
description: ${JSON.stringify(fm.description)}
tags: ${yamlList(fm.tags)}
routes: ${yamlList(fm.routes)}
sources: ${yamlList(fm.sources)}
origin: generated
---

${body.trim()}
`;
  writeFileSync(join(dir, 'SKILL.md'), md, 'utf8');
}

function resetGeneratedAreas() {
  for (const area of GENERATED_AREAS) {
    const p = join(root, 'skills', area);
    if (existsSync(p)) rmSync(p, { recursive: true, force: true });
    mkdirSync(p, { recursive: true });
  }
}

function renderPaperSkills() {
  let n = 0;
  for (const [id, entry] of Object.entries(WHITEPAPER_REGISTRY)) {
    if (!entry || entry.redirect) continue;
    const file = entry.file || entry.path;
    if (!file) continue;
    if (!existsSync(join(root, file))) continue;
    const skillId = slugify(id);
    const title = entry.title || id;
    const tags = [
      'paper',
      'whitepaper',
      ...(Array.isArray(entry.tags) ? entry.tags.slice(0, 6) : []),
      entry.category || 'docs',
    ].filter(Boolean);
    const routes = [];
    try {
      const href = whitepaperHref(id);
      if (href) routes.push(href);
    } catch {
      /* ignore */
    }
    writeSkill(
      'Papers',
      skillId,
      {
        id: skillId,
        name: title,
        description: `Whitepaper skill · ${title}`,
        tags,
        routes: [...new Set(routes)].slice(0, 4),
        sources: [file],
      },
      `# When to use
Guest or Player asks about this paper, its Doc ID, or related ship-blog note.

# Pointers (local)
- \`${file}\` — canonical markdown
${routes[0] ? `- \`${routes[0]}\` — public surface\n` : ''}
# Honesty
Catalog / Soft Story filing unless the paper's own Honesty boundary says otherwise. Do not upgrade narrative maps into unfinished physics or fab proofs.
`,
    );
    n += 1;
  }
  return n;
}

function renderShipPostSkills() {
  let n = 0;
  for (const [registryId, post] of Object.entries(QUESTFEST_BLOG_POSTS)) {
    if (!post?.slug || !post?.file) continue;
    const htmlPath = join('interfaces', post.file);
    if (!existsSync(join(root, htmlPath))) continue;
    const skillId = slugify(`ship-blog-${post.slug}`);
    const paper = WHITEPAPER_REGISTRY[registryId];
    const sources = [htmlPath];
    if (paper?.file) sources.push(paper.file);
    writeSkill(
      'Ship-Posts',
      skillId,
      {
        id: skillId,
        name: post.headline || post.slug,
        description: post.excerpt || `Ship-blog note · ${post.slug}`,
        tags: ['ship-blog', 'questfest', 'plain-language', post.slug],
        routes: [`/ship-blog/${post.slug}`, `/ship-blog/${post.slug}/`],
        sources,
      },
      `# When to use
Guest wants the plain-language ship-blog note for this paper.

# Pointers (local)
- \`${htmlPath}\` — ship-blog HTML
- \`/ship-blog/${post.slug}\` — public route
${paper?.file ? `- \`${paper.file}\` — full whitepaper\n` : ''}
# Honesty
Ship-blog is guest English over the paper — keep Honesty rails; tip / Fair Exchange when present.
`,
    );
    n += 1;
  }
  return n;
}

function renderProtocolSkills() {
  const dir = join(root, 'protocols');
  let n = 0;
  if (!existsSync(dir)) return 0;
  for (const name of readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    const rel = `protocols/${name}`;
    const id = slugify(`protocol-${basename(name, '.md')}`);
    writeSkill(
      'Protocols',
      id,
      {
        id,
        name: basename(name, '.md').replace(/_/g, ' '),
        description: `Protocol document · ${name}`,
        tags: ['protocol', 'nspfrnp', 'mca'],
        routes: [],
        sources: [rel],
      },
      `# When to use
Asks about NSPFRNP / MCA / Snap PRA / Seed:Edge protocol spine.

# Pointers (local)
- \`${rel}\`

# Honesty
Protocol catalog fidelity — architectural coordination, not wet-lab claims.
`,
    );
    n += 1;
  }
  return n;
}

function renderResearchSkills() {
  const dir = join(root, 'research');
  let n = 0;
  if (!existsSync(dir)) return 0;
  for (const name of readdirSync(dir)) {
    if (!name.startsWith('synthobs-')) continue;
    const suitePath = join(dir, name);
    if (!statSync(suitePath).isDirectory()) continue;
    const readme = join('research', name, 'README.md');
    const sources = [`research/${name}/`];
    if (existsSync(join(root, readme))) sources.unshift(readme);
    const id = slugify(`research-${name}`);
    writeSkill(
      'Research',
      id,
      {
        id,
        name,
        description: `SynthOBS empirical suite · ${name}`,
        tags: ['research', 'synthobs', 'empirical', name.replace(/^synthobs-/, '')],
        routes: [],
        sources,
      },
      `# When to use
Asks about this empirical suite, fixtures, or pipeline receipts.

# Pointers (local)
${sources.map((s) => `- \`${s}\``).join('\n')}

# Honesty
Empirical suite receipts stay tiered — narrative vs measured vs operational. Do not invent run numbers.
`,
    );
    n += 1;
  }
  return n;
}

function renderInterfaceSkills() {
  let n = 0;
  for (const surf of MAJOR_INTERFACES) {
    writeSkill(
      'Interfaces',
      surf.id,
      {
        id: surf.id,
        name: surf.name,
        description: surf.description,
        tags: surf.tags,
        routes: surf.routes,
        sources: surf.sources,
      },
      `# When to use
Guest asks where to go on the ship or how this surface works.

# Pointers (local)
${(surf.sources || []).map((s) => `- \`${s}\``).join('\n')}
${(surf.routes || []).map((r) => `- route \`${r}\``).join('\n')}

# Honesty
Edge hospitality map. Canvas remains site front door; QUESTFEST is the ship board.
`,
    );
    n += 1;
  }
  return n;
}

function main() {
  resetGeneratedAreas();
  const counts = {
    papers: renderPaperSkills(),
    shipPosts: renderShipPostSkills(),
    protocols: renderProtocolSkills(),
    research: renderResearchSkills(),
    interfaces: renderInterfaceSkills(),
  };
  const sync = spawnSync(process.execPath, [join(root, 'scripts/sync-lattice-skills-index.mjs')], {
    cwd: root,
    encoding: 'utf8',
  });
  if (sync.status !== 0) {
    console.error(sync.stderr || sync.stdout);
    process.exit(sync.status || 1);
  }
  console.log('fractiskills generate:', counts);
  console.log((sync.stdout || '').trim());
}

main();
