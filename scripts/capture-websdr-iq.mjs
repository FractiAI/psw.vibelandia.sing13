/**
 * Batch capture OpenWebRX frame for repo cache / local verify.
 * node scripts/capture-websdr-iq.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { captureOpenWebRxFrame } from '../lib/openwebrx-ingest.mjs';

const outDir = join(process.cwd(), 'data');
const frame = await captureOpenWebRxFrame({ timeoutMs: 28000 });
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, 'websdr-latest.json'), JSON.stringify(frame, null, 2));
console.log('OK', frame.endpointLabel, frame.frameType, frame.sampleCount, 'samples in', frame.captureMs, 'ms');
