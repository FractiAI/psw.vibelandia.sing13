#!/usr/bin/env node
/**
 * Sync README.md + interfaces/index.html interfaces HTML index.
 * Usage: npm run sync:interfaces-index
 */
import { syncInterfacesIndex } from '../lib/interfaces-readme-index.mjs';

const result = await syncInterfacesIndex({ cwd: process.cwd() });
console.log(JSON.stringify({ ok: true, ...result }, null, 2));
process.exit(0);
