/**
 * Functional Reality Catalog — store / retrieve / compare / recombine
 * generated TRGM structures with versioned recipes and validation metrics.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  DIGITAL_SEED,
  REALITY_CATALOG_VERSION,
  VALIDATION_SEED,
  PHI_EGS,
} from './constants.mjs';
import { generateTinyReality, evaluateReality } from '../../synthobs-tiny-reality-generation-model/src/computational-lab.mjs';
import { buildHolographicRhymeTree, generateStructuredStream } from '../../synthobs-tiny-reality-generation-model/src/triadic-octave-dna-lab.mjs';
import { buildWaveNodeFqCatalog } from '../../synthobs-tiny-reality-generation-model/src/wave-node-fq-catalog.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOG_DIR = path.resolve(__dirname, '../data/reality-catalog');

function ensureDir() {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
}

function realityIdFromRecipe(recipe) {
  const h = crypto.createHash('sha256');
  h.update(JSON.stringify({ id: recipe.id, nest: recipe.nestLevel, lattice: recipe.lattice, wave: recipe.wave }));
  return `reality-${h.digest('hex').slice(0, 16)}`;
}

/**
 * Build a catalog record for one generated tiny reality.
 */
export function materializeRealityRecord(index, { seed = VALIDATION_SEED, channelBias = null } = {}) {
  const recipe = generateTinyReality(seed, index);
  const stream = generateStructuredStream();
  const tree = buildHolographicRhymeTree(stream.stream);
  const evaled = evaluateReality(recipe);
  const genetic = buildWaveNodeFqCatalog();

  const record = {
    schema: 'trgm-reality-catalog-record/v1',
    version: REALITY_CATALOG_VERSION,
    realityId: realityIdFromRecipe(recipe),
    createdAt: new Date().toISOString(),
    seed,
    index,
    channelBias,
    recipe: {
      id: recipe.id,
      nestLevel: recipe.nestLevel,
      lattice: recipe.lattice,
      oscillators: recipe.oscillators,
      wave: recipe.wave,
      map: {
        W: recipe.map.W,
        H: recipe.map.H,
        nObs: recipe.map.nObs,
        start: recipe.map.start,
        goal: recipe.map.goal,
      },
      child: recipe.child,
      phiEgs: PHI_EGS,
    },
    parameters: {
      digitalSeed: DIGITAL_SEED,
      validationSeed: seed,
      gateNote: 'hard viability = geo+wave+nav; phase soft',
    },
    multiscaleTree: {
      depth: tree.depth,
      nLayers: tree.nLayers,
      coherent: tree.coherent,
      layerIds: tree.layers.map((l) => l.layerId),
    },
    spatial: {
      latticeNodes: recipe.lattice.nodeCount,
      oscillatorNodes: recipe.oscillators.nodeCount,
      mapW: recipe.map.W,
      mapH: recipe.map.H,
      obstacleCount: recipe.map.nObs,
    },
    geneticCatalogRef: {
      schema: genetic.schema,
      nEntries: genetic.entries.length,
      genesByChannel: genetic.summary.genesByChannel,
    },
    validation: {
      viable: evaled.viable,
      geometry: evaled.geometry,
      wave: { pass: evaled.wave.pass, l2: evaled.wave.l2 },
      phase: {
        hardGate: evaled.phase.hardGate,
        softSyncOk: evaled.phase.softSyncOk,
        rFinal: evaled.phase.rFinal,
      },
      navigation: {
        ok: evaled.navigation.ok,
        pathLength: evaled.navigation.pathLength,
      },
    },
  };
  return record;
}

export function storeReality(record, { dir = CATALOG_DIR } = {}) {
  ensureDir();
  const file = path.join(dir, `${record.realityId}.json`);
  fs.writeFileSync(file, JSON.stringify(record, null, 2));
  return file;
}

export function retrieveReality(realityId, { dir = CATALOG_DIR } = {}) {
  const file = path.join(dir, `${realityId}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function listRealities({ dir = CATALOG_DIR } = {}) {
  ensureDir();
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f.startsWith('reality-'))
    .map((f) => f.replace(/\.json$/, ''));
}

export function compareRealities(a, b) {
  return {
    sameVersion: a.version === b.version,
    bothViable: Boolean(a.validation?.viable && b.validation?.viable),
    deltaWaveL2: Math.abs((a.validation?.wave?.l2 || 0) - (b.validation?.wave?.l2 || 0)),
    deltaPathLength: Math.abs(
      (a.validation?.navigation?.pathLength || 0) - (b.validation?.navigation?.pathLength || 0),
    ),
    sameNestDepth: a.multiscaleTree?.depth === b.multiscaleTree?.depth,
    spatialDeltaNodes: Math.abs((a.spatial?.latticeNodes || 0) - (b.spatial?.latticeNodes || 0)),
  };
}

/** Recombine: take lattice from A, wave/map from B, re-evaluate. */
export function recombineRealities(a, b, { seed = VALIDATION_SEED, index = 777 } = {}) {
  const base = generateTinyReality(seed, index);
  // Overlay structural descriptors from parents (recipe-level recombination)
  const hybridRecipe = {
    ...base,
    id: `recombine-${a.realityId.slice(-6)}-${b.realityId.slice(-6)}`,
    lattice: { ...base.lattice, ...a.recipe.lattice },
    wave: { ...base.wave, ...b.recipe.wave },
    oscillators: { ...base.oscillators, ...a.recipe.oscillators },
    map: {
      ...base.map,
      W: b.recipe.map.W,
      H: b.recipe.map.H,
      nObs: a.recipe.map.nObs,
    },
  };
  const evaled = evaluateReality(hybridRecipe);
  const record = {
    schema: 'trgm-reality-catalog-record/v1',
    version: REALITY_CATALOG_VERSION,
    realityId: realityIdFromRecipe(hybridRecipe),
    createdAt: new Date().toISOString(),
    seed,
    index,
    parents: [a.realityId, b.realityId],
    recombination: 'lattice+oscillators←A · wave+mapWH←B',
    recipe: {
      id: hybridRecipe.id,
      nestLevel: hybridRecipe.nestLevel,
      lattice: hybridRecipe.lattice,
      oscillators: hybridRecipe.oscillators,
      wave: hybridRecipe.wave,
      map: {
        W: hybridRecipe.map.W,
        H: hybridRecipe.map.H,
        nObs: hybridRecipe.map.nObs,
        start: hybridRecipe.map.start,
        goal: hybridRecipe.map.goal,
      },
      child: hybridRecipe.child,
      phiEgs: PHI_EGS,
    },
    parameters: { digitalSeed: DIGITAL_SEED, validationSeed: seed },
    multiscaleTree: a.multiscaleTree,
    spatial: {
      latticeNodes: hybridRecipe.lattice.nodeCount,
      oscillatorNodes: hybridRecipe.oscillators.nodeCount,
      mapW: hybridRecipe.map.W,
      mapH: hybridRecipe.map.H,
      obstacleCount: hybridRecipe.map.nObs,
    },
    geneticCatalogRef: a.geneticCatalogRef,
    validation: {
      viable: evaled.viable,
      geometry: evaled.geometry,
      wave: { pass: evaled.wave.pass, l2: evaled.wave.l2 },
      phase: {
        hardGate: evaled.phase.hardGate,
        softSyncOk: evaled.phase.softSyncOk,
        rFinal: evaled.phase.rFinal,
      },
      navigation: { ok: evaled.navigation.ok, pathLength: evaled.navigation.pathLength },
    },
  };
  return record;
}

export function buildRealityCatalogStore({ n = 8 } = {}) {
  ensureDir();
  // clear previous run records
  for (const id of listRealities()) {
    fs.unlinkSync(path.join(CATALOG_DIR, `${id}.json`));
  }
  const records = [];
  for (let i = 0; i < n; i++) {
    const rec = materializeRealityRecord(i);
    storeReality(rec);
    records.push(rec);
  }
  let compare = null;
  let recombined = null;
  if (records.length >= 2) {
    compare = compareRealities(records[0], records[1]);
    recombined = recombineRealities(records[0], records[1]);
    storeReality(recombined);
  }
  const index = {
    schema: 'trgm-reality-catalog-index/v1',
    version: REALITY_CATALOG_VERSION,
    n: listRealities().length,
    ids: listRealities(),
    compareSample: compare,
    recombinedId: recombined?.realityId || null,
  };
  fs.writeFileSync(path.join(CATALOG_DIR, 'index.json'), JSON.stringify(index, null, 2));
  return { dir: CATALOG_DIR, index, records, compare, recombined };
}
