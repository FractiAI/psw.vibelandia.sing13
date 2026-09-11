#!/usr/bin/env node
/**
 * Rebuild skills/index.json from skills tree SKILL.md frontmatter.
 * Usage: node scripts/sync-lattice-skills-index.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  collectSkillsFromTree,
  LATTICE_SKILLS_PILOT,
} from '../lib/lattice-skills.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skills = collectSkillsFromTree(root);
const index = {
  schemaVersion: LATTICE_SKILLS_PILOT.schemaVersion,
  id: LATTICE_SKILLS_PILOT.id,
  honesty: LATTICE_SKILLS_PILOT.honesty,
  generatedAt: new Date().toISOString(),
  skillCount: skills.length,
  skills,
};

const outPath = join(root, 'skills', 'index.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`, 'utf8');
console.log(`lattice-skills index: ${skills.length} skills → skills/index.json`);
