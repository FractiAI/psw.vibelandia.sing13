import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
/**
 * WMAP residual lag 11 / 14 unknown-physics validation (E1–E4).
 * Prefers calling into cosmic-rhyme-expedition physics-search modules.
 */
import {
  DOC_ID,
  SEED,
  PHI_EGS,
  FOCUS_LAGS,
  HONESTY,
  HONESTY_TOKENS,
  REGISTRY_ID,
  ENGINE_SHELF_PINNED,
} from './constants.mjs';
import { runMathProofs } from './math.mjs';
import {
  runC4WmapResidualPhysics,
  runC4NovelPhysicsSearch,
} from '../../synthobs-cosmic-rhyme-expedition/src/physics-search.mjs';
import { loadWmapTt } from '../../synthobs-cosmic-rhyme-expedition/src/load.mjs';
import { mean, pearson } from '../../synthobs-cosmic-rhyme-expedition/src/stats.mjs';

/** Rebuild residual series the same way C4b does (for math lemmas). */
function rebuildWmapResiduals() {
  const rows = loadWmapTt().filter((r) => r.ell >= 2 && r.ell <= 900);
  const logEll = rows.map((r) => Math.log10(r.ell));
  const logCl = rows.map((r) => Math.log10(Math.max(r.cl, 1e-6)));
  const logEll2 = logEll.map((x) => x * x);
  // stepwise residualize against logEll then logEll^2 (matches physics-search)
  function residualize(y, x) {
    const n = y.length;
    const mx = mean(x);
    const my = mean(y);
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i += 1) {
      num += (x[i] - mx) * (y[i] - my);
      den += (x[i] - mx) * (x[i] - mx);
    }
    const b = den === 0 ? 0 : num / den;
    const a = my - b * mx;
    return y.map((yi, i) => yi - (a + b * x[i]));
  }
  let resid = residualize(logCl, logEll);
  resid = residualize(resid, logEll2);
  return { rows, resid };
}

export function runExpedition() {
  // Call into cosmic C4 modules (preferred over duplicating).
  // Use cosmic default seeds so lag 11/14 candidate hits regenerate identically.
  const wmap = runC4WmapResidualPhysics();
  const c4 = runC4NovelPhysicsSearch();

  const focusHits = (wmap.topLags || []).filter((t) => FOCUS_LAGS.includes(t.lag));
  const lag11 = focusHits.find((t) => t.lag === 11) || null;
  const lag14 = focusHits.find((t) => t.lag === 14) || null;

  // —— E1: confirm lag 11 and 14 candidate_novel_physics ——
  const e1 = {
    id: 'E1',
    name: 'confirm_lag11_lag14_candidate_novel_physics',
    focusLags: [...FOCUS_LAGS],
    lag11: lag11
      ? {
          lag: lag11.lag,
          corr: lag11.corr,
          pResidualShuffle: lag11.pResidualShuffle,
          verdict: lag11.verdict,
          nearAcousticSpacing: lag11.nearAcousticSpacing,
        }
      : null,
    lag14: lag14
      ? {
          lag: lag14.lag,
          corr: lag14.corr,
          pResidualShuffle: lag14.pResidualShuffle,
          verdict: lag14.verdict,
          nearAcousticSpacing: lag14.nearAcousticSpacing,
        }
      : null,
    bothCandidateNovel:
      lag11?.verdict === 'candidate_novel_physics' &&
      lag14?.verdict === 'candidate_novel_physics',
    source: 'runC4WmapResidualPhysics (cosmic-rhyme-expedition)',
  };

  // —— E2: assert nearAcousticSpacing false ——
  const e2 = {
    id: 'E2',
    name: 'assert_near_acoustic_spacing_false',
    lag11NearAcoustic: lag11?.nearAcousticSpacing === true,
    lag14NearAcoustic: lag14?.nearAcousticSpacing === true,
    bothFarFromAcoustic:
      lag11?.nearAcousticSpacing === false && lag14?.nearAcousticSpacing === false,
    acousticSpacingDefinition:
      'nearAcousticSpacing := lag ∈ [15,25] or lag ∈ {18..22} (ΛCDM first-peak family echo)',
  };

  // —— E3: contrast known_physics_rediscovery controls on other layers ——
  const knownHits = c4.summary?.knownHits || [];
  const novelHits = c4.summary?.novelHits || [];
  const e3 = {
    id: 'E3',
    name: 'contrast_known_physics_rediscovery_controls',
    nKnownPhysicsRediscovery: knownHits.length,
    nCandidateNovelPhysics: novelHits.length,
    knownControls: knownHits.slice(0, 8).map((h) => ({
      layer: h.layer,
      pair: h.pair ?? null,
      lag: h.lag ?? null,
      verdict: h.verdict,
      nearAcousticSpacing: h.nearAcousticSpacing ?? null,
      heldOutCorr: h.heldOutCorr ?? h.corr ?? null,
    })),
    novelWmapHits: novelHits
      .filter((h) => h.layer === 'wmap_tt_residual')
      .map((h) => ({
        lag: h.lag,
        corr: h.corr,
        pResidualShuffle: h.pResidualShuffle,
        nearAcousticSpacing: h.nearAcousticSpacing,
        verdict: h.verdict,
      })),
    controlsExist: knownHits.length > 0,
    source: 'runC4NovelPhysicsSearch (cosmic-rhyme-expedition)',
  };

  // —— E4: math lemmas ——
  const { resid } = rebuildWmapResiduals();
  const mathProofs = runMathProofs(resid, [...FOCUS_LAGS]);
  // also report lag abs-corr for focus lags as sanity
  const lagSanity = FOCUS_LAGS.map((lag) => {
    const xs = [];
    const ys = [];
    for (let i = 0; i + lag < resid.length; i += 1) {
      xs.push(resid[i]);
      ys.push(resid[i + lag]);
    }
    return { lag, absCorr: Math.abs(pearson(xs, ys)) };
  });
  const e4 = {
    id: 'E4',
    name: 'residual_correlation_symmetry_and_lag_definition',
    mathProofs,
    lagSanity,
  };


  // —— E5: assemble multipole residual wiring from existing public spectra ——
  const wiringPath = join(dirname(fileURLToPath(import.meta.url)), '../fixtures/wiring_literature.json');
  const wiring = JSON.parse(readFileSync(wiringPath, 'utf8'));
  const spectrumPieces = (wiring.pieces || []).filter((p) => p.publicSpectrum);
  const roles = new Set((wiring.pieces || []).map((p) => p.role));
  const required = ['real_wmap_tt', 'residual_lag_novel', 'acoustic_rediscovery_control', 'falsification_board'];
  const rolesOk = required.every((r) => roles.has(r));
  const e5 = {
    id: 'E5',
    name: 'assemble_new_wiring_from_existing_public_spectra',
    discoveryClass: wiring.discoveryClass,
    claim: wiring.claim,
    spectrumPieceCount: spectrumPieces.length,
    requiredRoles: required,
    rolesOk,
    assembledPath: wiring.assembledWiring?.path || [],
    edgeType: wiring.assembledWiring?.edgeType || null,
    falsifiers: wiring.falsifiers || [],
    doesNotClaim: wiring.doesNotClaim || [],
    candidateLagsConfirmed: e1.bothCandidateNovel && e2.bothFarFromAcoustic,
    // Cross-mission / beam injection remain PENDING falsifiers (not yet run here)
    pendingFalsifiers: ['X1_planck_cross_mission', 'X3_continuum_stress', 'X4_beam_injection', 'X5_mask_coupling'],
    passes: e1.bothCandidateNovel && e2.bothFarFromAcoustic && rolesOk && spectrumPieces.length >= 4,
    discovery: null,
  };
  e5.discovery = e5.passes
    ? 'new_wiring_from_existing_public_spectra_provisional'
    : 'wiring_assembly_failed';

  const pass =
    e1.bothCandidateNovel &&
    e2.bothFarFromAcoustic &&
    e3.controlsExist &&
    mathProofs.ok;

  const verdict = {
    unknownPhysicsCandidateConfirmed: pass,
    newWiringDiscovery: e5.passes,
    summary: e5.passes
      ? 'NEW WIRING DISCOVERY (provisional): residual multipole wiring lag 11↔14 assembled from real WMAP TT + residual gate + acoustic rediscovery controls + pre-registered beam/mask/Planck falsifiers. Candidate wiring — not a finished law until X1–X5 clear.'
      : 'WMAP residual lag 11/14 wiring assembly did not clear Soft Story rails.',
    claims: {
      lag11,
      lag14,
      knownControlsExist: e3.controlsExist,
      mathOk: mathProofs.ok,
    },
    doesNotClaim: [
      'finished physical law',
      'ΛCDM replacement',
      'ENGINE_SHELF physics pin',
      'instrument-systematics-free detection',
    ],
  };

  return {
    documentId: DOC_ID,
    registryId: REGISTRY_ID,
    seed: SEED,
    phiEgs: PHI_EGS,
    engineShelfPinned: ENGINE_SHELF_PINNED,
    focusLags: [...FOCUS_LAGS],
    honesty: HONESTY,
    honestyTokens: HONESTY_TOKENS,
    wmapResidual: {
      nEll: wmap.nEll,
      continuum: wmap.continuum,
      peakEnhancement: wmap.peakEnhancement,
      nCandidateNovelPhysics: wmap.nCandidateNovelPhysics,
      nKnownRediscovery: wmap.nKnownRediscovery,
      topLags: wmap.topLags,
    },
    mathProofs,
    experiments: { e1, e2, e3, e4, e5 },
    verdict,
  };
}
