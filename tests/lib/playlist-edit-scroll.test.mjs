import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(process.cwd());
const CSS = resolve(ROOT, 'apps/ss-vibelandia-questfest/src/styles/global.css');

describe('Edit playlist scroll surface', () => {
  it('does not clip the tracks panel (overflow trap)', () => {
    const css = readFileSync(CSS, 'utf8');
    const tracksBlock = css.match(/\.sp-pl-edit-tracks\s*\{[^}]+\}/);
    expect(tracksBlock?.[0]).toBeTruthy();
    expect(tracksBlock[0]).toMatch(/(?:^|\n)\s*overflow:\s*visible\s*;/m);
    expect(tracksBlock[0]).not.toMatch(/(?:^|\n)\s*overflow:\s*hidden\s*;/m);
  });

  it('makes the jukebox editing stage the scroll container', () => {
    const css = readFileSync(CSS, 'utf8');
    expect(css).toMatch(
      /\.jb-stage--editing\s+\.jb-stage__tracks\s*\{[^}]*overflow-y:\s*auto/s,
    );
    expect(css).toMatch(
      /\.jb-stage--editing\s+\.jb-stage__tracks\s+\.sp-pl-edit\s*\{[^}]*overflow:\s*visible/s,
    );
  });

  it('keeps reorder grips scroll-friendly (pan-y)', () => {
    const css = readFileSync(CSS, 'utf8');
    const grip = css.match(/\.sp-row-grip\s*\{[^}]+\}/);
    expect(grip?.[0]).toMatch(/touch-action:\s*pan-y/);
  });
});
