import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  LATTICE_SKILLS_PILOT,
  collectSkillsFromTree,
  loadSkillsIndex,
  matchSkills,
  buildLatticeSkillsPack,
  parseSkillFrontmatter,
} from '../../lib/lattice-skills.mjs';
import { assembleLatticePrompt } from '../../lib/lattice-prompt.mjs';

const root = join(import.meta.dirname, '../..');

describe('FractiSkills Goldilocks pilot', () => {
  it('indexes curated SKILL.md packages', () => {
    const collected = collectSkillsFromTree(root);
    expect(collected.length).toBeGreaterThanOrEqual(10);
    expect(collected.every((s) => s.path.endsWith('/SKILL.md'))).toBe(true);
    const index = loadSkillsIndex(root);
    expect(index.schemaVersion).toBe(LATTICE_SKILLS_PILOT.schemaVersion);
    expect(index.skills.length).toBe(collected.length);
    expect(index.honesty).toMatch(/not a whole-site crawl/i);
  });

  it('parses frontmatter tags and routes', () => {
    const md = readFileSync(
      join(root, 'skills/Lattice/lattice-product-surfaces/SKILL.md'),
      'utf8',
    );
    const fm = parseSkillFrontmatter(md);
    expect(fm.id).toBe('lattice-product-surfaces');
    expect(fm.tags).toContain('lattice');
    expect(fm.routes).toContain('/lattice');
  });

  it('matches skills by ask keywords without inventing ids', () => {
    const index = loadSkillsIndex(root);
    const hits = matchSkills('Explain the AI catalog layer and resonant data', index);
    expect(hits[0].id).toMatch(/catalog|lattice|ai-catalog/);
  });

  it('builds pointer-first skill pack with pinch budget', () => {
    const pack = buildLatticeSkillsPack({
      message: 'How does Lattice Chat Token Maxing and Seed pack work on /lattice-chat?',
      complex: true,
      nestTopology: 'octave99',
      root,
    });
    expect(pack).toContain('FractiSkills pilot');
    expect(pack).toContain('skills/');
    expect(pack).toMatch(/Skill pinches/);
    // Must not dump entire index body as one blob of all skills
    const pinchCount = (pack.match(/#### skills\//g) || []).length;
    expect(pinchCount).toBeLessThanOrEqual(LATTICE_SKILLS_PILOT.maxPinches);
  });

  it('skips skills when nest is off', () => {
    const pack = buildLatticeSkillsPack({
      message: 'What is the catalog layer?',
      complex: true,
      nestTopology: 'none',
      root,
    });
    expect(pack).toBe('');
  });

  it('wires into assembleLatticePrompt for complex Infinite Octaves turns', () => {
    const prompt = assembleLatticePrompt({
      message:
        'Map how Infinite Octaves Lattice Chat sits as an AI catalog layer versus the Official Prospectus voyage doors',
      nestTopology: 'octave99',
      mode: 'full',
      omitHistory: true,
      root,
    });
    expect(prompt).toContain('FractiSkills pilot');
    expect(prompt).toMatch(/skills\/.*SKILL\.md/);
  });
});
