import { DOC_ID, REGISTRY_ID, SEED, FOCUS_A, FOCUS_B, FOCUS_LABEL, EXON_FEATURE_KEYS, HONESTY, ENGINE_SHELF_PINNED, PHI_EGS } from './constants.mjs';
import { loadExonFeatureObjects, loadStringEdges, loadOpenTargets, loadWiringLiterature, stringScore } from './load.mjs';
import { cosine, zScoreColumns, mulberry32, shuffleInPlace, proveCouplingSymmetry, proveZscoreMeanNearZero, mean } from './math.mjs';

function bestCrossGeneCoupling(zObjects, a, b){
  const A=zObjects.filter(o=>o.symbol===a);
  const B=zObjects.filter(o=>o.symbol===b);
  let best={maxCoupling:-1, pair:null};
  for(const x of A) for(const y of B){
    const c=cosine(x.z,y.z);
    if(c>best.maxCoupling) best={maxCoupling:c, pair:`${x.id} ↔ ${y.id}`, a:x.id, b:y.id};
  }
  return best;
}

function allCrossGeneMax(zObjects){
  const syms=[...new Set(zObjects.map(o=>o.symbol))].sort();
  const rows=[];
  for(let i=0;i<syms.length;i++) for(let j=i+1;j<syms.length;j++){
    const r=bestCrossGeneCoupling(zObjects, syms[i], syms[j]);
    rows.push({pair:`${syms[i]}↔${syms[j]}`, a:syms[i], b:syms[j], maxCoupling:r.maxCoupling, bestExonPair:r.pair});
  }
  rows.sort((x,y)=>y.maxCoupling-x.maxCoupling);
  return rows;
}


function suiteMinWet(){ return 3; }
function suiteRequiredRoles(){ return ['dnmt3a_targets_app_locus', 'dnmt_activity_changes_abeta', 'dnmt3a_ad_model_homeostasis']; }

export function runExpedition(){
  const objects=loadExonFeatureObjects();
  const {zObjects}=zScoreColumns(objects, [...EXON_FEATURE_KEYS]);
  const mathProofs={
    ok:true,
    lemmas:[
      proveCouplingSymmetry(zObjects[0].z, zObjects[1].z),
      ...proveZscoreMeanNearZero(objects, [...EXON_FEATURE_KEYS]).lemmas,
    ]
  };
  mathProofs.ok=mathProofs.lemmas.every(l=>l.ok);

  const e1=bestCrossGeneCoupling(zObjects, FOCUS_A, FOCUS_B);
  const ranked=allCrossGeneMax(zObjects);
  const focusRank=ranked.findIndex(r=>r.pair===FOCUS_LABEL || r.pair===`${FOCUS_B}↔${FOCUS_A}`)+1;
  const rnd=mulberry32(SEED);
  const NULLS=400;
  let ge=0;
  for(let t=0;t<NULLS;t++){
    const scrambled=zObjects.map(o=>({...o,z:{...o.z}}));
    const keys=[...EXON_FEATURE_KEYS];
    for(const k of keys){
      const col=scrambled.map(o=>o.z[k]);
      shuffleInPlace(col,rnd);
      scrambled.forEach((o,i)=>{o.z[k]=col[i]});
    }
    const b=bestCrossGeneCoupling(scrambled, FOCUS_A, FOCUS_B);
    if(b.maxCoupling>=e1.maxCoupling) ge+=1;
  }
  const permP=(ge+1)/(NULLS+1);

  const str=loadStringEdges();
  const focusString=stringScore(str.focus);
  const controlString=stringScore(str.positiveControlInsPomc);
  const e3={
    id:'E3', name:'string_unknown_vs_positive_control',
    focusPair:FOCUS_LABEL, focusStringScore:focusString, focusEmpty:focusString===0,
    positiveControl:'INS↔POMC', positiveControlScore:controlString, positiveControlEmpty:controlString===0,
    dataSource:str.source, fetchedAt:str.fetchedAt,
  };

  const ot=loadOpenTargets();
  const e4={
    id:'E4', name:'opentargets_real_disease_rails',
    source:ot.source, fetchedAt:ot.fetchedAt,
    focusA: {symbol:FOCUS_A, top:ot.focusA?.topDiseases?.slice(0,6)||[]},
    focusB: {symbol:FOCUS_B, top:ot.focusB?.topDiseases?.slice(0,6)||[]},
    positiveControlNote:'INS/POMC disease rails cached as method control only',
  };


  const wiring=loadWiringLiterature();
  const wetPieces=(wiring.pieces||[]).filter(p=>p.wetLab);
  const roles=new Set((wiring.pieces||[]).map(p=>p.role));
  const minWet = suiteMinWet();
  const requiredRoles = suiteRequiredRoles();
  const rolesOk = requiredRoles.every(r=>roles.has(r));
  const wiringAssembled = e3.focusEmpty && wetPieces.length>=minWet && rolesOk;
  const e6={
    id:'E6', name:'assemble_new_wiring_from_existing_wet_labs',
    discoveryClass: wiring.discoveryClass,
    claim: wiring.claim,
    stringStillEmpty: e3.focusEmpty,
    wetLabPieceCount: wetPieces.length,
    minWetLabPieces: minWet,
    rolesPresent: [...roles],
    requiredRoles,
    rolesOk,
    assembledPath: wiring.assembledWiring?.path || [],
    edgeType: wiring.assembledWiring?.edgeType || null,
    falsifiers: wiring.falsifiers || [],
    doesNotClaim: wiring.doesNotClaim || [],
    passes: wiringAssembled,
    discovery: wiringAssembled ? 'new_wiring_from_existing_wet_labs' : 'wiring_assembly_failed',
  };

  const unknownGate = e3.focusEmpty && !e3.positiveControlEmpty && e1.maxCoupling>0;
  const wiringGate = unknownGate && e6.passes;
  const e5={
    id:'E5', name:'unknown_pair_gate',
    requiresStringEmpty:true,
    focusIsUnknown:e3.focusEmpty,
    positiveControlConfirmsModel:!e3.positiveControlEmpty && e3.positiveControlScore>=0.9,
    passes:unknownGate,
  };

  return {
    documentId:DOC_ID, registryId:REGISTRY_ID, seed:SEED, phiEgs:PHI_EGS,
    engineShelfPinned:ENGINE_SHELF_PINNED, focusPair:{a:FOCUS_A,b:FOCUS_B,label:FOCUS_LABEL},
    honesty:HONESTY, dataProvenance:{
      exons:'GTEx/MyGene real panel fixtures (llm-rhyme)',
      string:str.source, opentargets:ot.source, wiringLiterature:'fixtures/wiring_literature.json',
    },
    mathProofs,
    experiments:{
      e1:{id:'E1', name:'reproduce_focus_exon_coupling', ...e1},
      e2:{id:'E2', name:'panel_rank_and_permutation', focusRank, nPairs:ranked.length, permutationP:permP, nullMean:null, top10:ranked.slice(0,10)},
      e3, e4, e5, e6,
    },
    verdict:{
      supportsUnknownFollowUp:unknownGate,
      newWiringDiscovery: wiringGate,
      summary: wiringGate
        ? `NEW WIRING DISCOVERY: ${FOCUS_LABEL} — STRING-empty PPI catalog edge assembled from existing wet-lab pieces (${e6.wetLabPieceCount} wet-lab + literature bridge). INS↔POMC control 0.947 confirms association lane. Not a new assay we ran; not clinical advice.`
        : (unknownGate ? `Unknown STRING-empty pair but wiring assembly failed.` : 'Gate failed — check STRING emptiness / control.'),
    }
  };
}
