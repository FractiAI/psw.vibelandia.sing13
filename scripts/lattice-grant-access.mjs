#!/usr/bin/env node
/**
 * Grant Lattice guest access for one month.
 * Usage: node scripts/lattice-grant-access.mjs someone@example.com
 * Creator valetpru@gmail.com is always permanent — no grant needed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CREATOR_EMAIL,
  makeGuestGrant,
  normalizeEmail,
  isValidEmailShape,
} from '../lib/lattice-access.mjs';

const email = normalizeEmail(process.argv[2] || '');
if (!email || !isValidEmailShape(email)) {
  console.error('Usage: node scripts/lattice-grant-access.mjs someone@example.com');
  process.exit(1);
}

if (email === normalizeEmail(CREATOR_EMAIL)) {
  console.log(`${CREATOR_EMAIL} already has permanent creator privilege — no grant written.`);
  process.exit(0);
}

const path = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'lattice-access.json');
const doc = JSON.parse(readFileSync(path, 'utf8'));
doc.creatorEmail = doc.creatorEmail || CREATOR_EMAIL;
doc.grants = Array.isArray(doc.grants) ? doc.grants : [];

const grant = makeGuestGrant(email);
const idx = doc.grants.findIndex((g) => normalizeEmail(g.email) === email);
if (idx >= 0) doc.grants[idx] = { ...doc.grants[idx], ...grant };
else doc.grants.push(grant);

writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`, 'utf8');
console.log(`Granted Lattice access to ${email} until ${grant.expiresAt}`);
