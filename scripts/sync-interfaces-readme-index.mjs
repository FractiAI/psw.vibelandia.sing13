#!/usr/bin/env node
/**
 * Sync README.md interfaces HTML index (end-of-file listing).
 * Usage: npm run sync:interfaces-index
 */
import { syncInterfacesReadmeIndex } from '../lib/interfaces-readme-index.mjs';

const result = await syncInterfacesReadmeIndex({ cwd: process.cwd() });
console.log(JSON.stringify({ ok: true, ...result }, null, 2));
process.exit(0);
