import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const FIX=join(dirname(fileURLToPath(import.meta.url)),'../fixtures');
export function loadGenes(){return JSON.parse(readFileSync(join(FIX,'genes.panel.json'),'utf8')).genes}
export function loadStringEdges(){return JSON.parse(readFileSync(join(FIX,'string_edges.json'),'utf8'))}
export function loadOpenTargets(){return JSON.parse(readFileSync(join(FIX,'opentargets.json'),'utf8'))}
export function loadExonFeatureObjects(symbols=null){
  const genes=loadGenes();
  const by=Object.fromEntries(genes.map(g=>[g.symbol,g]));
  const panel=JSON.parse(readFileSync(join(FIX,'exons.panel.json'),'utf8'));
  const chromNum=c=>Number(String(c).replace(/^chr/i,''))||0;
  const out=[];
  for(const e of panel.exons){
    if(symbols && !symbols.includes(e.symbol)) continue;
    const g=by[e.symbol];
    const length=Math.max(1,e.exonEnd-e.exonStart);
    out.push({
      id:`${e.symbol}:ex${e.exonIndex}@${e.chrom}:${e.exonStart}`,
      symbol:e.symbol, layer:'genome_exon',
      order:chromNum(e.chrom)*1e9+e.exonStart,
      features:{
        chrom_num:chromNum(e.chrom), start:e.exonStart, end:e.exonEnd,
        log_len:Math.log(length), exon_index:e.exonIndex,
        strand:e.strand==='-'?-1:1,
        gene_span:g?Math.log(Math.max(1,g.end-g.start)):0,
        tss_dist:g?Math.log(Math.abs(e.exonStart-g.tss)+1):0,
        log_cpg_prox:0, near_cpg_n:0,
      }
    });
  }
  return out;
}
export function stringScore(edges){if(!edges||!edges.length)return 0;return Math.max(...edges.map(e=>e.score||0))}
export function loadWiringLiterature(){return JSON.parse(readFileSync(join(FIX,'wiring_literature.json'),'utf8'))}
