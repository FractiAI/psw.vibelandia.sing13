/**
 * Likely-function glosses for rhyme partner pairs / discoveries.
 *
 * Soft Story / expedition labels: what the held-out relationship is *likely*
 * doing in the theater — not finished physics, clinical genetics, or GO proof.
 */

/** @type {Record<string, string>} */
export const GENE_FUNCTION_GLOSS = {
  INS: 'insulin peptide hormone (glucose regulation)',
  PDX1: 'pancreatic β-cell transcription factor',
  POMC: 'proopiomelanocortin (appetite / ACTH precursor)',
  NPY: 'neuropeptide Y (appetite / stress signaling)',
  DNMT1: 'maintenance DNA methyltransferase',
  DNMT3A: 'de novo DNA methyltransferase',
  APP: 'amyloid precursor protein',
  SOD1: 'Cu/Zn superoxide dismutase (antioxidant)',
  DYRK1A: 'dual-specificity kinase (neurodevelopment)',
  TMPRSS2: 'serine protease (airway / androgen-linked)',
};

/** Known gene-pair Soft Story edges (literature co-themes — not catalog claims). */
const GENE_PAIR_SOFT_STORY = {
  'APP|DYRK1A':
    'Alzheimer / Down-syndrome literature co-theme (chr21 structural twins in panel)',
  'DYRK1A|APP':
    'Alzheimer / Down-syndrome literature co-theme (chr21 structural twins in panel)',
  'INS|POMC':
    'endocrine peptide axis Soft Story (glucose ↔ appetite peptide precursors)',
  'POMC|INS':
    'endocrine peptide axis Soft Story (glucose ↔ appetite peptide precursors)',
  'DNMT1|DNMT3A':
    'DNA methylation writer family Soft Story (maintenance ↔ de novo)',
  'DNMT3A|DNMT1':
    'DNA methylation writer family Soft Story (maintenance ↔ de novo)',
  'NPY|SOD1':
    'cross-chromosome feature-space twin (neuropeptide ↔ antioxidant enzyme) — not an established pathway edge',
  'SOD1|NPY':
    'cross-chromosome feature-space twin (neuropeptide ↔ antioxidant enzyme) — not an established pathway edge',
  'DNMT3A|POMC':
    'chr2 neighborhood Soft Story (methyltransferase ↔ peptide precursor) — locus proximity + feature rhyme',
  'POMC|DNMT3A':
    'chr2 neighborhood Soft Story (methyltransferase ↔ peptide precursor) — locus proximity + feature rhyme',
  'DNMT3A|APP':
    'epigenetic writer ↔ amyloid precursor Soft Story — feature rhyme, not a finished disease edge',
  'APP|DNMT3A':
    'epigenetic writer ↔ amyloid precursor Soft Story — feature rhyme, not a finished disease edge',
  'APP|TMPRSS2':
    'chr21 co-panel Soft Story (amyloid precursor ↔ airway protease)',
  'TMPRSS2|APP':
    'chr21 co-panel Soft Story (amyloid precursor ↔ airway protease)',
  'TMPRSS2|DYRK1A':
    'chr21 co-panel Soft Story (airway protease ↔ neurodevelopmental kinase)',
  'DYRK1A|TMPRSS2':
    'chr21 co-panel Soft Story (airway protease ↔ neurodevelopmental kinase)',
  'DNMT1|INS':
    'methylation writer ↔ insulin Soft Story — feature rhyme across metabolic/epigenetic panels',
  'INS|DNMT1':
    'methylation writer ↔ insulin Soft Story — feature rhyme across metabolic/epigenetic panels',
  'PDX1|POMC':
    'pancreatic transcription ↔ appetite peptide Soft Story — endocrine panel feature rhyme',
  'POMC|PDX1':
    'pancreatic transcription ↔ appetite peptide Soft Story — endocrine panel feature rhyme',
};

/** Cosmic feature-pair motif glosses (from cosmic C2 rediscoveryHints). */
export const MOTIF_FUNCTION_GLOSS = {
  'log_orbper~log_rade':
    'period–radius structure / radius-valley corridor audit (selection + physics rhyme)',
  'log_rade~st_teff':
    'stellar-irradiation ↔ planet-radius correlation audit',
  'log_bmasse~log_rade':
    'mass–radius structural twin (bulk density / composition corridor)',
  'log_orbper~log_bmasse':
    'period–mass orbital architecture twin',
  'st_mass~st_rad':
    'host-star mass–radius main-sequence selection twin',
  'disc_year~st_rad':
    'survey-history motif: discovery epoch ↔ stellar-radius slice (selection, not new physics)',
  'disc_year~st_teff':
    'survey-history motif: discovery epoch ↔ stellar-temperature slice (selection, not new physics)',
  'disc_year~st_mass':
    'survey-history motif: discovery epoch ↔ host mass (selection)',
  'h_mag~log_dist':
    'NEO size-proxy ↔ approach-distance dynamical selection',
  'log_dist~log_v_rel':
    'NEO encounter speed–distance orbital-mechanics selection',
  'h_mag~log_v_rel':
    'NEO size-proxy ↔ encounter-speed dynamical selection',
  'maj_ax~v_mag':
    'deep-sky angular-size ↔ brightness morphology/selection twin',
  'min_ax~v_mag':
    'deep-sky minor-axis ↔ brightness morphology/selection twin',
  'maj_ax~min_ax':
    'axis-ratio morphology glue (elongated vs round classes)',
  'maj_ax~ra':
    'angular size ↔ sky-position catalog adjacency (selection caution)',
  'min_ax~ra':
    'minor axis ↔ sky-position catalog adjacency (selection caution)',
  'dec~min_ax':
    'declination ↔ minor-axis catalog morphology adjacency',
  'dec~maj_ax':
    'declination ↔ major-axis catalog morphology adjacency',
  'ra~dec':
    'sky-position adjacency (coordinate triviality — treat cautiously)',
  'b_mag~v_mag':
    'color–magnitude adjacency in deep-sky photometry',
};

const FRED_GLOSS = {
  CPIAUCSL: 'US CPI (consumer prices)',
  UNRATE: 'US unemployment rate',
  FEDFUNDS: 'federal funds rate',
  INDPRO: 'industrial production',
};

/**
 * @param {string} id
 * @returns {{ a: string, b: string }}
 */
export function splitDiscoveryPartners(id) {
  if (!id) return { a: '', b: '' };
  if (id.includes(' ↔ ')) {
    const [a, b] = id.split(' ↔ ');
    return { a: a.trim(), b: (b || '').trim() };
  }
  if (id.includes('||')) {
    const [a, b] = id.split('||');
    return { a: a.trim(), b: (b || '').trim() };
  }
  if (id.includes('~')) {
    const [a, b] = id.split('~');
    return { a: a.trim(), b: (b || '').trim() };
  }
  const m = String(id).match(/^(\S+)\s+(contact\s+\S+)$/i);
  if (m) return { a: m[1], b: m[2] };
  return { a: String(id), b: '' };
}

/**
 * @param {string} exonId
 * @returns {string | null}
 */
function exonSymbol(exonId) {
  const m = String(exonId || '').match(/^([A-Za-z0-9]+):ex/);
  return m ? m[1] : null;
}

/**
 * @param {string} theater
 * @returns {string}
 */
function theaterFamily(theater) {
  const t = String(theater || '').toLowerCase();
  if (t.includes('exoplanet')) return 'exoplanet';
  if (t.includes('neo')) return 'neo';
  if (t.includes('ngc')) return 'ngc';
  if (t.includes('wmap')) return 'wmap';
  if (t.includes('exon')) return 'exon';
  if (t.includes('chrm') || t.includes('chrM'.toLowerCase()) || t.includes('genome · chrm') || t.includes('genome_chrm'))
    return 'chrm';
  if (t.includes('protein') || t.includes('pdb')) return 'protein';
  if (t.includes('knowledge') || t.includes('hotpot')) return 'knowledge';
  if (t.includes('macro') || t.includes('fred')) return 'macro';
  if (t.includes('collab')) return 'collab';
  return 'generic';
}

/**
 * @param {{ theater?: string, discoveryId?: string, kind?: string, detail?: string, queryId?: string, partnerId?: string }} d
 * @returns {{ likelyFunction: string, partnerAFunction?: string, partnerBFunction?: string }}
 */
export function annotateLikelyFunction(d) {
  const kind = d.kind || '';
  const theater = d.theater || '';
  const id = d.discoveryId || '';
  const { a, b } = splitDiscoveryPartners(id);
  const queryId = d.queryId || a;
  const partnerId = d.partnerId || b;
  const family = theaterFamily(theater);

  /** @type {string | undefined} */
  let partnerAFunction;
  /** @type {string | undefined} */
  let partnerBFunction;
  let likelyFunction = '';

  if (kind === 'candidate_novel_physics' || /WMAP residual lag/i.test(id)) {
    const lag = (id.match(/lag\s+(\d+)/i) || [])[1];
    likelyFunction = lag
      ? `Candidate residual multipole coupling at lag ${lag} after known-template controls — possible new acoustic-scale structure under nulls (not a finished law)`
      : 'Candidate residual multipole coupling after known-template controls — possible new acoustic-scale structure under nulls (not a finished law)';
    return { likelyFunction, partnerAFunction: 'WMAP TT residual spectrum', partnerBFunction: lag ? `lag-${lag} residual partner` : undefined };
  }

  if (kind === 'known_physics_rediscovery') {
    const motif = MOTIF_FUNCTION_GLOSS[id];
    likelyFunction =
      motif ||
      (d.detail && !/Known-template/.test(d.detail)
        ? d.detail
        : 'Known-template residual rediscovery (control / sanity check)');
    return { likelyFunction };
  }

  if (kind === 'open_motif_survivor') {
    likelyFunction =
      MOTIF_FUNCTION_GLOSS[id] ||
      d.detail ||
      'Held-out open relational motif (survey/physics selection rhyme)';
    return { likelyFunction, partnerAFunction: a || undefined, partnerBFunction: b || undefined };
  }

  if (kind === 'aware_only_long_range_contact' || family === 'protein') {
    const pdb = a || queryId;
    const contactRaw = b || partnerId || '';
    const residues = String(contactRaw).replace(/^contact\s+/i, '').trim();
    likelyFunction = residues
      ? `Long-range fold contact ${residues} on ${pdb} — structural closure AWARE recovered that linear/flat MSA missed`
      : `Long-range fold contact on ${pdb} — structural closure AWARE recovered that linear/flat MSA missed`;
    partnerAFunction = pdb ? `PDB structure ${pdb}` : undefined;
    partnerBFunction = residues ? `residue contact ${residues}` : undefined;
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (kind === 'aware_only_title_pair' || (family === 'knowledge' && id.includes('||'))) {
    likelyFunction = `Multi-hop knowledge bridge: supporting title pair that answers only when both pages are joined (${a} || ${b})`;
    partnerAFunction = a ? `Wikipedia/Hotpot supporting page: ${a}` : undefined;
    partnerBFunction = b ? `Wikipedia/Hotpot supporting page: ${b}` : undefined;
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (kind === 'aware_only_teleconnection' || family === 'macro') {
    const ga = FRED_GLOSS[a] || a;
    const gb = FRED_GLOSS[b] || b;
    likelyFunction = `Macro teleconnection: ${ga} co-moves with ${gb} in FRED feature space (AWARE-only recovery)`;
    partnerAFunction = ga;
    partnerBFunction = gb;
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (kind === 'collab_synergy_discovery' || family === 'collab') {
    likelyFunction =
      'Collaboration synergy: joint AWARE seat recovers title-pair bridges neither solo recovers (whole > OR of parts)';
    return { likelyFunction };
  }

  if (family === 'exon') {
    const sa = exonSymbol(queryId);
    const sb = exonSymbol(partnerId);
    partnerAFunction = sa ? `${sa}: ${GENE_FUNCTION_GLOSS[sa] || 'panel protein-coding gene'}` : undefined;
    partnerBFunction = sb ? `${sb}: ${GENE_FUNCTION_GLOSS[sb] || 'panel protein-coding gene'}` : undefined;
    const key = sa && sb ? `${sa}|${sb}` : '';
    const soft = key ? GENE_PAIR_SOFT_STORY[key] : null;
    likelyFunction = soft
      ? `Cross-gene exon structural twin + ${soft}`
      : sa && sb
        ? `Cross-gene exon structural twin (${sa} ↔ ${sb}) on length/index/TSS/CpG features — feature-space rhyme, not a wet-lab edge`
        : 'Cross-gene exon structural twin on length/index/TSS/CpG features — feature-space rhyme, not a wet-lab edge';
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (family === 'chrm') {
    likelyFunction =
      'Mitochondrial sequence-window twin: similar GC/CpG/entropy composition across distant chrM offsets (demo genome theater)';
    partnerAFunction = queryId ? `chrM window ${queryId}` : undefined;
    partnerBFunction = partnerId ? `chrM window ${partnerId}` : undefined;
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (family === 'exoplanet') {
    likelyFunction =
      'Exoplanet structural twin: held-out neighbor in orbital/stellar feature space (period, radius, mass, host Teff/mass/radius) — same-host trivial excluded';
    partnerAFunction = queryId ? `exoplanet ${queryId}` : undefined;
    partnerBFunction = partnerId ? `exoplanet ${partnerId}` : undefined;
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (family === 'neo') {
    likelyFunction =
      'NEO encounter twin: similar close-approach kinematics (distance, relative speed, H-mag size proxy) — same-designation trivial excluded';
    partnerAFunction = queryId ? `NEO approach ${queryId}` : undefined;
    partnerBFunction = partnerId ? `NEO approach ${partnerId}` : undefined;
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (family === 'ngc') {
    likelyFunction =
      'Deep-sky morphology twin: similar RA/Dec/axis/magnitude neighborhood in OpenNGC feature space';
    partnerAFunction = queryId ? `OpenNGC object ${queryId}` : undefined;
    partnerBFunction = partnerId ? `OpenNGC object ${partnerId}` : undefined;
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (family === 'wmap') {
    if (/^lag-/i.test(a) || /^lag-/i.test(id)) {
      likelyFunction = 'WMAP TT spectral lag coupling on the awareness board';
    } else {
      likelyFunction =
        'CMB TT multipole twin: held-out Cl(ℓ) partner outside the local ell window (acoustic-scale adjacency in feature/lag space)';
    }
    partnerAFunction = queryId ? `multipole ${queryId}` : undefined;
    partnerBFunction = partnerId ? `multipole ${partnerId}` : undefined;
    return { likelyFunction, partnerAFunction, partnerBFunction };
  }

  if (d.detail && d.detail.length < 220 && !/Director map/.test(d.detail)) {
    return { likelyFunction: d.detail };
  }

  likelyFunction =
    'Held-out partner recovered by shared-world / awareness coupling where flat local windows missed — theater feature-space twin';
  return { likelyFunction };
}

/**
 * Attach likelyFunction (+ optional side glosses) onto a discovery row.
 * @template {Record<string, unknown>} T
 * @param {T} d
 * @returns {T & { likelyFunction: string, partnerAFunction?: string, partnerBFunction?: string }}
 */
export function withLikelyFunction(d) {
  const ann = annotateLikelyFunction(d);
  return {
    ...d,
    likelyFunction: ann.likelyFunction,
    ...(ann.partnerAFunction ? { partnerAFunction: ann.partnerAFunction } : {}),
    ...(ann.partnerBFunction ? { partnerBFunction: ann.partnerBFunction } : {}),
  };
}
