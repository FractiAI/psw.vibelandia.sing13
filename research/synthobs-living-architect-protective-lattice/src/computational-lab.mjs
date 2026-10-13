/**
 * Computational lab — Living Architect Protective Lattice (Homeostasis Expedition)
 * LA-1: Observable Boot-Up hierarchical graph results (manuscript carry-forward)
 * LA-2: External protective-structure dataset inventory
 * LA-3: Cross-dataset harmonization schema (paper §10.2 field list)
 *
 * Org-discovery fixtures only — not harmonized field validation, not universal blueprint proof.
 */

import { BOOT_UP_MANUSCRIPT_SEED } from './constants.mjs';

/** Manuscript Table / §5.2 hierarchical reference family — Infinite Octave vs simple chain. */
export const BOOT_UP_GRAPH_CARRY_FORWARD_FIXTURE = Object.freeze({
  seed: BOOT_UP_MANUSCRIPT_SEED,
  reference_family: 'hierarchical',
  infinite_octave: Object.freeze({
    strategy: 'infinite_octave',
    required_edge_coverage_pct: 88.3,
    extra_edge_rate_pct: 11.7,
    robustness_pct: 97.5,
    mean_dependency_edges: 217.5,
  }),
  simple_chain: Object.freeze({
    strategy: 'simple_chain',
    required_edge_coverage_pct: 45.1,
    extra_edge_rate_pct: 54.9,
    robustness_pct: 9.9,
    mean_dependency_edges: 98,
  }),
  manuscript_note:
    'Carry-forward from Observable Boot-Up manuscript execution (11 Oct 2026); qualitative conclusions align with BU-1 replay — numeric drift possible until generator hash pinned.',
});

/** External datasets named in Bracket 7 org-discovery — inventory only. */
export const DATASET_INVENTORY_FIXTURE = Object.freeze([
  Object.freeze({
    id: 'bco-dmo-735583',
    provider: 'BCO-DMO',
    persistent_id: '10.1575/1912/bco-dmo.735583.1',
    dataset_key: '735583',
    title:
      'Net calcification, gross calcification, and linear extension — Caribbean corals (OA + warming lab)',
    domain: 'coral_biomineralization',
    status: 'identified-not-harmonized',
    harmonization_status: 'identified-not-harmonized',
  }),
  Object.freeze({
    id: 'noaa-la-parguera',
    provider: 'NOAA',
    site: 'La Parguera',
    region: 'Puerto Rico / Caribbean',
    title: 'La Parguera reef and water-quality field observations (protective-structure context)',
    domain: 'coral_reef_field',
    status: 'identified-not-harmonized',
    harmonization_status: 'identified-not-harmonized',
  }),
  Object.freeze({
    id: 'zenodo-5001086',
    provider: 'Zenodo',
    persistent_id: '10.5281/zenodo.5001086',
    dataset_key: '5001086',
    title:
      'Coastal acidification impacts on shell mineral structure of bivalve molluscs (Fitzer et al.)',
    domain: 'mollusk_shell_biomineralization',
    status: 'identified-not-harmonized',
    harmonization_status: 'identified-not-harmonized',
  }),
]);

/**
 * Paper §10.2 — cross-dataset harmonization schema (declared fields; no merged table yet).
 * Order matches manuscript section 10.2 listing.
 */
export const HARMONIZATION_SCHEMA_FIELDS = Object.freeze([
  { field: 'harmonized_record_id', type: 'string', required: true },
  { field: 'source_dataset_id', type: 'enum', required: true },
  { field: 'source_native_record_key', type: 'string', required: true },
  { field: 'observation_datetime_utc', type: 'datetime', required: true },
  { field: 'latitude_deg', type: 'float', required: false },
  { field: 'longitude_deg', type: 'float', required: false },
  { field: 'depth_m', type: 'float', required: false },
  { field: 'site_label', type: 'string', required: false },
  { field: 'taxon_species', type: 'string', required: true },
  { field: 'taxon_group', type: 'enum', required: true },
  { field: 'life_stage_or_size_class', type: 'string', required: false },
  { field: 'experimental_or_field', type: 'enum', required: true },
  { field: 'temperature_c', type: 'float', required: false },
  { field: 'seawater_ph', type: 'float', required: false },
  { field: 'pco2_uatm', type: 'float', required: false },
  { field: 'carbonate_chemistry_proxy', type: 'string', required: false },
  { field: 'calcification_rate', type: 'float', required: false },
  { field: 'linear_extension_rate', type: 'float', required: false },
  { field: 'shell_or_skeleton_thickness_mm', type: 'float', required: false },
  { field: 'surface_area_or_shell_area', type: 'float', required: false },
  { field: 'mineral_polymorph', type: 'enum', required: false },
  { field: 'crystallographic_control_metric', type: 'float', required: false },
  { field: 'protective_function_proxy_label', type: 'string', required: false },
  { field: 'measurement_method', type: 'string', required: true },
  { field: 'quality_flag', type: 'string', required: false },
  { field: 'harmonization_status', type: 'enum', required: true },
]);

const REQUIRED_INVENTORY_KEYS = Object.freeze([
  'bco-dmo-735583',
  'noaa-la-parguera',
  'zenodo-5001086',
]);

function bootUpFixtureChecks() {
  const io = BOOT_UP_GRAPH_CARRY_FORWARD_FIXTURE.infinite_octave;
  const ch = BOOT_UP_GRAPH_CARRY_FORWARD_FIXTURE.simple_chain;
  return {
    seed_matches: BOOT_UP_GRAPH_CARRY_FORWARD_FIXTURE.seed === BOOT_UP_MANUSCRIPT_SEED,
    hierarchical_io_coverage_88_3: io.required_edge_coverage_pct === 88.3,
    hierarchical_io_robustness_97_5: io.robustness_pct === 97.5,
    hierarchical_io_edges_217_5: io.mean_dependency_edges === 217.5,
    hierarchical_chain_coverage_45_1: ch.required_edge_coverage_pct === 45.1,
    hierarchical_chain_robustness_9_9: ch.robustness_pct === 9.9,
    io_beats_chain_coverage: io.required_edge_coverage_pct > ch.required_edge_coverage_pct + 20,
    io_beats_chain_robustness: io.robustness_pct > ch.robustness_pct + 50,
  };
}

function inventoryChecks() {
  const ids = DATASET_INVENTORY_FIXTURE.map((d) => d.id);
  const allPresent = REQUIRED_INVENTORY_KEYS.every((k) => ids.includes(k));
  const allIdentified = DATASET_INVENTORY_FIXTURE.every(
    (d) => d.status === 'identified-not-harmonized' && d.harmonization_status === 'identified-not-harmonized',
  );
  return {
    count_is_three: DATASET_INVENTORY_FIXTURE.length === 3,
    required_ids_present: allPresent,
    all_identified_not_harmonized: allIdentified,
    bco_dmo_key: DATASET_INVENTORY_FIXTURE.find((d) => d.id === 'bco-dmo-735583')?.dataset_key === '735583',
    zenodo_key: DATASET_INVENTORY_FIXTURE.find((d) => d.id === 'zenodo-5001086')?.dataset_key === '5001086',
    noaa_la_parguera_site:
      DATASET_INVENTORY_FIXTURE.find((d) => d.id === 'noaa-la-parguera')?.site === 'La Parguera',
  };
}

function harmonizationSchemaChecks() {
  const names = HARMONIZATION_SCHEMA_FIELDS.map((f) => f.field);
  const requiredCore = [
    'harmonized_record_id',
    'source_dataset_id',
    'taxon_species',
    'taxon_group',
    'experimental_or_field',
    'measurement_method',
    'harmonization_status',
  ];
  return {
    field_count: HARMONIZATION_SCHEMA_FIELDS.length,
    min_field_count: HARMONIZATION_SCHEMA_FIELDS.length >= 20,
    has_required_core: requiredCore.every((f) => names.includes(f)),
    ends_with_harmonization_status: names[names.length - 1] === 'harmonization_status',
    unique_field_names: new Set(names).size === names.length,
  };
}

export function runComputationalLabBattery() {
  const bootUp = bootUpFixtureChecks();
  const inventory = inventoryChecks();
  const schema = harmonizationSchemaChecks();

  const plainChecks = {
    ...bootUp,
    ...inventory,
    ...schema,
  };
  const allPlainPass = Object.values(plainChecks).every(Boolean);

  return {
    fixtures: {
      boot_up_graph_carry_forward: BOOT_UP_GRAPH_CARRY_FORWARD_FIXTURE,
      dataset_inventory: DATASET_INVENTORY_FIXTURE,
      harmonization_schema_fields: HARMONIZATION_SCHEMA_FIELDS,
    },
    plainChecks,
    allPlainPass,
    honesty:
      'Org-discovery fixtures — manuscript boot-up carry-forward, identified external datasets, declared harmonization schema. Not merged empirical tables, not universal protective blueprint validation.',
  };
}
