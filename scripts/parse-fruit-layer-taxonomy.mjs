#!/usr/bin/env node
/**
 * Parse Fruit Layer gift taxonomy from canonical raw corpus (section headers + gift lines).
 * Writes data/fruit-layer/gift-taxonomy.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const rawPath = join(root, 'data/fruit-layer/GIFT_TAXONOMY_RAW.txt');
const outPath = join(root, 'data/fruit-layer/gift-taxonomy.json');

const ROMAN = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
  'XXI',
  'XXII',
  'XXIII',
  'XXIV',
  'XXV',
  'XXVI',
  'XXVII',
  'XXVIII',
];

/** Sections whose gifts live in lettered subsections (A–J). */
const SUBSECTION_SECTION_IDS = ['XXVII', 'XXVIII'];

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function parseRaw(text) {
  const lines = text.split(/\r?\n/);
  const sections = [];
  const subsections = {};
  const metaOperators = [];
  const signatureGifts = [];
  let current = null;
  let currentSub = null;
  let mode = 'body'; // body | meta | signature | subsection
  let subsectionKey = null;

  const sectionRe = /^([IVXLCDM]+)\.\s+(.+)$/;
  const subRe = /^([A-J])\.\s+(.+)$/;
  const sigRe = /^(\d{4})\.\s+(.+)$/;
  const metaBulletRe = /^Gift\s+(.+?)\s*[—–-]\s*(.+)$/i;
  const subsectionHeaderRe = /^(XXVII|XXVIII)\.\s+(.+)$/i;

  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    if (t.startsWith('Where this fits in the tree')) {
      mode = 'footer';
      current = null;
      currentSub = null;
      subsectionKey = null;
      continue;
    }
    if (mode === 'footer') continue;

    const subSecMatch = t.match(subsectionHeaderRe);
    if (subSecMatch) {
      subsectionKey = subSecMatch[1].toUpperCase();
      mode = 'subsection';
      const sec = {
        id: subsectionKey,
        roman: subsectionKey,
        title: subSecMatch[2].trim(),
        gifts: [],
      };
      sections.push(sec);
      current = sec;
      subsections[subsectionKey] = subsections[subsectionKey] ?? [];
      currentSub = null;
      continue;
    }

    if (/^XXV\.\s+/i.test(t)) {
      mode = 'meta';
      sections.push({ id: 'XXV', roman: 'XXV', title: t.replace(/^XXV\.\s+/, ''), gifts: [] });
      current = null;
      subsectionKey = null;
      continue;
    }
    if (/^XXVI\.\s+/i.test(t)) {
      mode = 'signature';
      sections.push({ id: 'XXVI', roman: 'XXVI', title: t.replace(/^XXVI\.\s+/, ''), gifts: [] });
      current = null;
      subsectionKey = null;
      continue;
    }

    const secMatch = t.match(sectionRe);
    if (secMatch && ROMAN.includes(secMatch[1]) && mode !== 'subsection') {
      const id = secMatch[1];
      if (SUBSECTION_SECTION_IDS.includes(id)) {
        mode = 'subsection';
        subsectionKey = id;
      } else {
        mode = 'body';
        subsectionKey = null;
      }
      const sec = { id, roman: id, title: secMatch[2].trim(), gifts: [] };
      sections.push(sec);
      current = sec;
      currentSub = null;
      if (SUBSECTION_SECTION_IDS.includes(id)) {
        subsections[id] = subsections[id] ?? [];
      }
      continue;
    }

    if (mode === 'subsection' && subsectionKey) {
      const subMatch = t.match(subRe);
      if (subMatch) {
        currentSub = {
          id: subMatch[1],
          title: subMatch[2].trim(),
          gifts: [],
        };
        subsections[subsectionKey].push(currentSub);
        continue;
      }
    }

    if (mode === 'meta') {
      if (metaBulletRe.test(t)) {
        const m = t.match(metaBulletRe);
        metaOperators.push({ id: slugify(m[1]), name: m[1].trim(), description: m[2].trim() });
        continue;
      }
      const dashIdx = t.search(/\s[—–-]\s/);
      if (dashIdx >= 0 && !/^\d{4}\./.test(t)) {
        const name = t.slice(0, dashIdx).trim();
        const description = t.slice(dashIdx).replace(/^\s[—–-]\s/, '').trim();
        metaOperators.push({ id: slugify(name), name, description });
        continue;
      }
      continue;
    }

    if (mode === 'signature') {
      const sig = t.match(sigRe);
      if (sig) {
        const rest = sig[2].trim();
        const dashIdx = rest.search(/\s[—–-]\s/);
        const name = dashIdx >= 0 ? rest.slice(0, dashIdx).trim() : rest;
        const description =
          dashIdx >= 0 ? rest.slice(dashIdx).replace(/^\s[—–-]\s/, '').trim() : '';
        signatureGifts.push({
          id: Number(sig[1]),
          name,
          description,
          slug: slugify(name),
        });
        continue;
      }
    }

    // gift line: not a header, not explanatory paragraph starters
    if (
      /^These gifts|^A gift may|^The Fruit Layer|^You're right|^In the Fruit Layer|^They can reinforce|^Beauty is|^Fashion is|^Style is|^Swag is|^Charisma is|^The important insight|^Core principle:|^Fruit Layer distinction:/i.test(
        t,
      )
    ) {
      continue;
    }
    if (t.length > 120 && t.includes('.')) continue;

    const gift = t.replace(/\.$/, '').trim();
    if (!gift || /^[\d]+\./.test(gift)) continue;

    if (mode === 'subsection' && currentSub) {
      currentSub.gifts.push(gift);
    } else if (current && mode === 'body') {
      current.gifts.push(gift);
    }
  }

  return {
    version: '2026-10-14',
    documentId: 'WP-SYNTHOBS-FRUIT-LAYER-GIFT-TAXONOMY-2026-10-14',
    sections,
    subsections,
    sectionNotes: {
      XXVIII: {
        corePrinciple:
          'Wealth is one expression of abundance, not its entirety. Abundance includes material resources, time, opportunity, knowledge, relationships, autonomy, beauty, generosity, and the capacity to regenerate what sustains life.',
        fruitLayerDistinction:
          'A gift is a capacity; its fruit is what that capacity produces in practice. These entries are a working taxonomy of capabilities and outcomes, not a claim that every item is scientifically established as a distinct or independent human trait.',
        giftIdRange: '1231–1440',
      },
    },
    metaOperators,
    signatureGifts,
  };
}

function main() {
  const raw = readFileSync(rawPath, 'utf8');
  const data = parseRaw(raw);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, `${JSON.stringify(data, null, 2)}\n`);
  let giftCount = 0;
  for (const s of data.sections) giftCount += s.gifts.length;
  for (const subs of Object.values(data.subsections)) {
    for (const sub of subs) giftCount += sub.gifts.length;
  }
  console.log(
    JSON.stringify({
      sections: data.sections.length,
      metaOperators: data.metaOperators.length,
      signatureGifts: data.signatureGifts.length,
      giftCount,
      xxviiiSubsections: data.subsections.XXVIII?.length ?? 0,
      outPath,
    }),
  );
}

main();
