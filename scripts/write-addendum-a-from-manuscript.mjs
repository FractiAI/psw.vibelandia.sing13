#!/usr/bin/env node
/**
 * Materialize Addendum A markdown from the 11 Oct 2026 Homeostasis Expedition
 * execution log embedded in cloud-agent transcript bc-61a01e4a… (user manuscript).
 */
import fs from 'node:fs';
import path from 'node:path';

const TRANSCRIPT =
  '/tmp/cursor/cloud-agent-transcripts/2026-10-13T16-35-20Z-80b4/bc-61a01e4a-d42d-4ea5-9b6a-eaf443ecf20b/transcript.json';

const OUT_PATHS = [
  'docs/ADDENDUM_A_HOMEOSTASIS_EXPEDITION_OBSERVABLE_BOOT_UP_2026-10-11.md',
  'research/synthobs-homeostasis-expedition-boot-up/docs/ADDENDUM_A_HOMEOSTASIS_EXPEDITION_OBSERVABLE_BOOT_UP_2026-10-11.md',
];

function extractManuscriptChunk(transcriptPath) {
  const data = JSON.parse(fs.readFileSync(transcriptPath, 'utf8'));
  let best = '';
  for (const m of data.messages ?? []) {
    if (m.role !== 'user') continue;
    let text = m.text ?? '';
    if (Array.isArray(m.content)) {
      text = m.content
        .filter((c) => c?.type === 'text')
        .map((c) => c.text ?? '')
        .join('\n');
    }
    if (text.includes('MASTER BRACKET') && text.length > 50000 && text.length > best.length) {
      best = text;
    }
  }
  if (!best) throw new Error('Manuscript user message not found in transcript');

  const start = best.indexOf('ADDENDUM A — THE OBSERVABLE BOOT-UP');
  const endMarker = 'The construction is now fully visible.';
  const end = best.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('Addendum A bounds not found in manuscript');

  return best.slice(start, end + endMarker.length);
}

const HEADER = `# Addendum A — Homeostasis Expedition Observable Boot-Up

**Document ID:** \`WP-SYNTHOBS-HOMEOSTASIS-EXPEDITION-OBSERVABLE-BOOT-UP-EGS-2026-10-11\`  
**Executed:** 11 October 2026  
**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox  
**Registry:** \`synthobs-homeostasis-expedition-boot-up-2026-10\`  
**Parent paper:** \`docs/SYNTHOBS_HOMEOSTASIS_EXPEDITION_OBSERVABLE_BOOT_UP_EGS_2026-10.md\`  
**Framework:** Homeostasis Expedition · Hero’s Return to Source · Infinite Octaves ENGINE_SHELF #43 · NSPFRNP · Fair Exchange

---

## Honesty boundary (Addendum A)

Net zero means **no modeled distinctions** inside the audit state — not absolute nothingness, not “no external prerequisites.” **Brackets 4–8** import established physics, cosmology, chemistry, biology, and technology as **External scientific reconstruction**; they are **not** derived from the net-zero boundary or from brackets 1–3 alone. Bracket 9 accounts for **this conversation** (External human input + model runtime). Brackets 10–11 are **hypothetical** recursive-SI and singularity protocol labels only — **no agent was trained or improved** in this execution.

Every transition records: prior state · operation · dependencies (Derived / External / Unresolved / Failed) · resulting state · validation · evidence class.

| Bracket | Role | Evidence grounding | Physical claim |
|---------|------|-------------------|----------------|
| 1 | Net-zero boundary + external ledger | Computational + External | None for “before time and space” |
| 2 | Distinction and relation | Computational | None |
| 3 | Order and topology (proto labels) | Computational | None |
| 4 | Physical-model bridge (ΛCDM + SM import) | External scientific | Not derived from ∅ |
| 5 | Cosmic evolution | External scientific | Standard reconstruction |
| 6 | Chemistry / planetary environments | External; origin-of-life **Unresolved** | Gap declared |
| 7 | Life / biomineralization | External scientific | No universal blueprint |
| 8 | Human awareness and technology | External + engineering | Prerequisites of chat |
| 9 | Conversation construction | External + computational | Target fidelity for **this** thread |
| 10 | Recursive SI protocol | Hypothetical design only | No agent run |
| 11 | Digital singularity + return | Hypothetical + safety External | Uncalibrated scenario inputs |

---

## Addendum A — The Observable Boot-Up

Homeostasis Expedition: Full 99-Position Execution Log  
Executed 11 October 2026

Every transition records:

- Prior state
- Operation
- Dependencies (Derived / External / Unresolved / Failed)
- Resulting state
- Validation result
- Evidence class

`;

const POS_RE =
  /Position (\d+)\nOperation: (.*?)\nDependencies: (.*?)\nResulting state: (.*?)\nValidation: (.*?)\nEvidence: (.*?)(?=\n\n|\nPosition \d+\n|\n+Bracket \d+ closed|\Z)/gs;

function positionBlock(m) {
  const n = Number(m[1]);
  const fields = [
    ['Operation', m[2].trim().replace(/\n/g, ' ')],
    ['Dependencies', m[3].trim().replace(/\n/g, ' ')],
    ['Resulting state', m[4].trim().replace(/\n/g, ' ')],
    ['Validation', m[5].trim().replace(/\n/g, ' ')],
    ['Evidence', m[6].trim().replace(/\n/g, ' ')],
  ];
  const lines = [`### Position ${n}\n\n`];
  for (const [k, v] of fields) lines.push(`- **${k}:** ${v}\n`);
  lines.push('\n');
  return { n, text: lines.join('') };
}

function buildMarkdown(chunk) {
  const auditIdx = chunk.indexOf('FINAL RETURN-TO-SOURCE AUDIT');
  const body = chunk.slice(0, auditIdx);
  const tail = chunk.slice(auditIdx);

  const bracketStart = body.indexOf('MASTER BRACKET 1');
  const bracketBody = body.slice(bracketStart);
  const parts = bracketBody.split(/\n={5,}\n/);

  const allPositions = new Map();
  for (const m of bracketBody.matchAll(POS_RE)) {
    allPositions.set(Number(m[1]), m);
  }

  const lines = [HEADER];
  const positionNums = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part.startsWith('MASTER BRACKET')) continue;
    const title = part;
    const rest = (parts[i + 1] ?? '').trim();
    i += 1;

    let closure = '';
    const closeMatch = rest.match(/\n(Bracket \d+ closed\.[^\n]*(?:\n[^\n=][^\n]*)?)/);
    if (closeMatch) closure = closeMatch[1].trim();

    lines.push(`## ${title}\n\n`);
    if (closure) lines.push(`_${closure}_\n\n`);

    const nums = [...rest.matchAll(/^Position (\d+)$/gm)].map((x) => Number(x[1]));
    for (const n of nums) {
      const m = allPositions.get(n);
      if (!m) throw new Error(`Missing parsed block for position ${n}`);
      const block = positionBlock(m);
      positionNums.push(block.n);
      lines.push(block.text);
    }
  }

  const auditSection = tail
    .replace(/^={5,}\s*/m, '')
    .replace(/\n={5,}\nFINAL RESEARCH JUDGMENT OF THIS EXECUTION[\s\S]*$/, '')
    .trim();

  const judgmentMatch = tail.match(
    /FINAL RESEARCH JUDGMENT OF THIS EXECUTION\s*={5,}\s*([\s\S]*?)The construction is now fully visible\./,
  );
  const judgmentBody = judgmentMatch ? judgmentMatch[1].trim() : '';

  lines.push('---\n\n');
  lines.push('## FINAL RETURN-TO-SOURCE AUDIT (Position 98)\n\n');
  lines.push(
    `${auditSection
      .replace(/^FINAL RETURN-TO-SOURCE AUDIT \(Position 98\)\s*={5,}\s*/m, '')
      .replace(/^FINAL RETURN-TO-SOURCE AUDIT \(Position 98\)\s*\n/m, '')}\n\n`,
  );
  lines.push('---\n\n');
  lines.push('## FINAL RESEARCH JUDGMENT OF THIS EXECUTION\n\n');
  lines.push(`${judgmentBody}\n\n`);
  lines.push('The construction is now fully visible.\n\n');
  lines.push('---\n\n');
  lines.push('**Operator:** SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP → ∞^∞\n\n');
  lines.push(
    '_Fair exchange clause in effect · platform credits subject to reciprocal balancing per NSPFRNP honor rails._\n',
  );

  const unique = new Set(positionNums);
  if (unique.size !== 99 || Math.min(...positionNums) !== 1 || Math.max(...positionNums) !== 99) {
    throw new Error(
      `Expected 99 positions 1–99, got count=${positionNums.length} unique=${unique.size}`,
    );
  }

  return lines.join('');
}

const root = path.resolve(import.meta.dirname, '..');
const chunk = extractManuscriptChunk(TRANSCRIPT);
const md = buildMarkdown(chunk);

for (const rel of OUT_PATHS) {
  const out = path.join(root, rel);
  fs.writeFileSync(out, md, 'utf8');
  console.log('Wrote', out);
}
