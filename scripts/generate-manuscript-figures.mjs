#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const source = process.env.LATTICE_MANUSCRIPT_RECEIPT || 'data/openrouter-lattice-followup-deterministic.json';
const out = join(root, 'docs/manuscript/figures');
const data = JSON.parse(readFileSync(join(root, source), 'utf8'));
mkdirSync(out, { recursive: true });
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const labels = data.byTask.map((x) => x.taskId.replace(/^qa_|^reasoning_|^coding_/, '').replaceAll('_', ' '));
const colors = { lattice: '#2563eb', standard: '#ea580c', naive: '#16a34a' };
const treatments = ['lattice', 'standard', 'naive'];
const names = { lattice: 'Lattice', standard: 'Standard', naive: 'Naive' };
function chart(title, metric, maxOverride = null) {
  const W = 1200, H = 560, left = 220, right = 35, top = 58, bottom = 120;
  const plotW = W - left - right, plotH = H - top - bottom;
  const values = data.byTask.flatMap((row) => treatments.map((t) => Number(row[t]?.[metric] ?? 0)));
  const max = maxOverride ?? Math.max(...values, 1);
  const y = (v) => top + plotH - (v / max) * plotH;
  const groupW = plotW / data.byTask.length;
  const barW = Math.min(24, groupW / 4);
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><rect width="100%" height="100%" fill="white"/><text x="${left}" y="30" font-family="Arial,sans-serif" font-size="20" font-weight="bold">${esc(title)}</text>`;
  for (let i = 0; i <= 4; i++) { const v = max * i / 4; const yy = y(v); s += `<line x1="${left}" y1="${yy}" x2="${W-right}" y2="${yy}" stroke="#e5e7eb"/><text x="${left-10}" y="${yy+5}" text-anchor="end" font-family="Arial" font-size="12" fill="#4b5563">${Math.round(v).toLocaleString()}</text>`; }
  data.byTask.forEach((row, i) => { const gx = left + i * groupW + groupW / 2; treatments.forEach((t, j) => { const v = Number(row[t]?.[metric] ?? 0); const x = gx + (j - 1) * barW * 1.25 - barW / 2; const yy = y(v); s += `<rect x="${x}" y="${yy}" width="${barW}" height="${Math.max(0, top+plotH-yy)}" fill="${colors[t]}"><title>${esc(names[t])}: ${v}</title></rect>`; }); s += `<text x="${gx}" y="${H-bottom+22}" text-anchor="middle" transform="rotate(-35 ${gx} ${H-bottom+22})" font-family="Arial" font-size="11">${esc(labels[i])}</text>`; });
  treatments.forEach((t, i) => { const x = left + i * 130; s += `<rect x="${x}" y="${H-30}" width="16" height="16" fill="${colors[t]}"/><text x="${x+23}" y="${H-17}" font-family="Arial" font-size="13">${names[t]}</text>`; });
  return `${s}</svg>\n`;
}
function paired(metric, title, yLabel) {
  const W=900,H=560,left=90,right=40,top=60,bottom=70,pw=W-left-right,ph=H-top-bottom;
  const rows=data.results.filter((r)=>r.treatment==='lattice'||r.treatment==='standard'); const byKey=new Map();
  for(const r of rows){const k=`${r.rep}:${r.taskId}`;const p=byKey.get(k)||{};p[r.treatment]=Number(metric(r));byKey.set(k,p)}
  const pairs=[...byKey.values()].filter(p=>p.lattice!=null&&p.standard!=null); const vals=pairs.flatMap(p=>[p.lattice,p.standard]); const max=Math.max(...vals,1); const sx=v=>left+(v/max)*pw; const sy=i=>top+(i+1)*ph/(pairs.length+1);
  let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}"><rect width="100%" height="100%" fill="white"/><text x="${left}" y="30" font-family="Arial" font-size="20" font-weight="bold">${esc(title)}</text><line x1="${left}" y1="${top}" x2="${left}" y2="${H-bottom}" stroke="#374151"/><line x1="${left}" y1="${H-bottom}" x2="${W-right}" y2="${H-bottom}" stroke="#374151"/>`;
  for(let i=0;i<=4;i++){const v=max*i/4,xx=sx(v);s+=`<line x1="${xx}" y1="${top}" x2="${xx}" y2="${H-bottom}" stroke="#e5e7eb"/><text x="${xx}" y="${H-bottom+22}" text-anchor="middle" font-family="Arial" font-size="12">${Math.round(v).toLocaleString()}</text>`}
  pairs.forEach((p,i)=>{const yy=sy(i),a=sx(p.lattice),b=sx(p.standard);s+=`<line x1="${a}" y1="${yy}" x2="${b}" y2="${yy}" stroke="#9ca3af"/><circle cx="${a}" cy="${yy}" r="5" fill="${colors.lattice}"/><circle cx="${b}" cy="${yy}" r="5" fill="${colors.standard}"/>`});
  s+=`<text x="${left+pw/2}" y="${H-12}" text-anchor="middle" font-family="Arial" font-size="12">${esc(yLabel)} · paired observations (Lattice → Standard)</text><rect x="${left}" y="${H-35}" width="14" height="14" fill="${colors.lattice}"/><text x="${left+20}" y="${H-23}" font-family="Arial" font-size="12">Lattice</text><rect x="${left+100}" y="${H-35}" width="14" height="14" fill="${colors.standard}"/><text x="${left+120}" y="${H-23}" font-family="Arial" font-size="12">Standard</text></svg>\n`; return s;
}
const outputs = [
  ['followup_accuracy.svg', chart('Follow-up control: strict accuracy by task', 'accuracy', 1)],
  ['followup_lenient_accuracy.svg', chart('Follow-up control: lenient accuracy by task', 'accuracyLenient', 1)],
  ['followup_tokens.svg', chart('Follow-up control: structural tokens by task', 'tokens')],
  ['followup_latency.svg', chart('Follow-up control: deterministic latency control by task', 'latency')],
  ['followup_tokens_per_correct.svg', chart('Follow-up control: tokens per correct outcome', 'tokensPerCorrect')],
  ['followup_paired_efficiency.svg', paired((r) => r.tokens, 'Follow-up control: paired token comparison', 'structural tokens')],
  ['followup_paired_accuracy.svg', paired((r) => r.correct, 'Follow-up control: paired accuracy comparison', 'strict accuracy')],
];
for (const [name, svg] of outputs) {
  const svgPath = join(out, name);
  writeFileSync(svgPath, svg);
  const pdfPath = join(out, name.replace(/\.svg$/, '.pdf'));
  execFileSync('rsvg-convert', ['-f', 'pdf', '-o', pdfPath, svgPath]);
}
console.log(JSON.stringify({ source, outputs: outputs.flatMap(([name]) => [name, name.replace(/\.svg$/, '.pdf')]), status: data.status }, null, 2));
