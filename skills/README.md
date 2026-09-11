# FractiSkills · Infinite Octaves full local corpus

Portable `SKILL.md` packages for **Infinite Octaves Omniversal Lattice Chat** — a companion corpus under the AI catalog layer.

## What this is
- **Curated** meta skills in `Lattice/`, `Core/`, `Ship-Blog/`
- **Generated** skills from local registries:
  - `Papers/` ← whitepaper registry
  - `Ship-Posts/` ← QUESTFEST ship-blog posts
  - `Protocols/` ← `protocols/*.md`
  - `Research/` ← `research/synthobs-*`
  - `Interfaces/` ← major guest surfaces
- Pointer-first bodies Lattice Chat pinches via `lib/lattice-skills.mjs` (≤8 pointers, ≤2 pinches)

## What this is not
- Not a live FractiSkills crawl of the public site
- Not Skillarum embedded as a runtime dependency
- Not a claim of infinite GPU-free scaling

## Commands
```bash
npm run generate:lattice-skills   # discover → render → index
npm run sync:lattice-skills       # rebuild skills/index.json from SKILL.md frontmatter only
```

## Load path
`assembleLatticePrompt` → `buildLatticeSkillsPack` (complex asks / explicit skill asks; skipped when nest is off).

→ ∞^∞
