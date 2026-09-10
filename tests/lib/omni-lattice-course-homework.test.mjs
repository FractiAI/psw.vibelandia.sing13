import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function read(rel) {
  return readFileSync(join(ROOT, rel), 'utf8');
}

function loadCourseData() {
  const src = read('interfaces/omni-lattice-course-content.js');
  return new Function(`const window = {}; ${src}; return window.OMNI_LATTICE_COURSE;`)();
}

describe('Omni-Lattice course · homework weeks + companion textbook', () => {
  const data = loadCourseData();
  const modules = data.syllabus.modules;

  it('labels every week as Homework: Week N', () => {
    expect(modules).toHaveLength(6);
    modules.forEach((mod, i) => {
      expect(mod.label).toBe(`Homework: Week ${i + 1}`);
      expect(mod.part).toBe(`Homework: Week ${i + 1}`);
    });
    for (const ch of data.chapters) {
      expect(ch.part).toMatch(/^Homework: Week [1-6]$/);
    }
  });

  it('every homework week assigns course lessons, a textbook chapter, and whitepapers', () => {
    modules.forEach((mod, i) => {
      const hw = mod.homework;
      expect(hw).toBeTruthy();
      expect(hw.heading).toBe(`Homework: Week ${i + 1}`);
      expect(hw.course.href).toMatch(/^#ch\//);
      expect(hw.course.label).toContain('Online course');
      expect(hw.textbook.href).toBe(`/omni-lattice-textbook#chapter-${i + 1}`);
      expect(hw.papers.length).toBeGreaterThan(0);
      for (const p of hw.papers) {
        expect(p.href).toContain('/interfaces/whitepaper-surface.html?id=');
      }
    });
  });

  it('companion textbook page exists with six chapter anchors and honesty rail', () => {
    const page = read('interfaces/omni-lattice-textbook.html');
    for (let n = 1; n <= 6; n += 1) {
      expect(page).toContain(`id="chapter-${n}"`);
      expect(page).toContain(`Homework: Week ${n}`);
    }
    expect(page).toContain('Companion Textbook');
    expect(page).toContain('Full-synthesis vantage');
    expect(page).toContain('Honesty first.');
    expect(page).toContain('href="/omni-lattice-course"');
  });

  it('companion textbook Edition 1.1 includes foundations primer, worked examples, and hand-calc tables', () => {
    const page = read('interfaces/omni-lattice-textbook.html');
    expect(page).toContain('Edition 1.1');
    expect(page).toContain('id="foundations"');
    expect(page).toContain('Foundations primer');
    expect(page).toContain('Worked example');
    expect(page).toContain('table class="olt-calc"');
    expect(page).toContain('Hand-calculation');
    // One worked-example block per chapter + primer drills
    expect((page.match(/Worked example ·/g) || []).length).toBeGreaterThanOrEqual(7);
    expect((page.match(/table class="olt-calc"/g) || []).length).toBeGreaterThanOrEqual(8);
    expect(page).toContain('Φ_EGS');
    expect(page).toContain('0.001779');
    expect(page).toContain('8,019');
  });

  it('course page renders homework panels and links to the textbook', () => {
    const page = read('interfaces/omni-lattice-course.html');
    expect(page).toContain('olc-mod__homework');
    expect(page).toContain('href="/omni-lattice-textbook"');
    expect(page).toContain('hw.textbook');
  });

  it('/omni-lattice-textbook rewrites to the textbook page, not the course', () => {
    const vercel = read('vercel.json');
    expect(vercel).toMatch(
      /"source":\s*"\/omni-lattice-textbook",\s*"destination":\s*"\/interfaces\/omni-lattice-textbook\.html"/,
    );
  });
});
