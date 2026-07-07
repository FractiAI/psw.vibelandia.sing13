import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AAA_DRIVING_COSTS_2025,
  GAMMA_FLOOR_USD,
  MICRO_MOBILITY_OPERATING,
  UW_URBAN_FREIGHT_LAB,
} from './constants.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

export function compareCapitalLeak() {
  const micro = MICRO_MOBILITY_OPERATING.operatingPerMileUsd;
  const aaa = AAA_DRIVING_COSTS_2025;
  const tiers = [
    { id: 'aaa_composite', label: 'AAA composite average', perMileUsd: aaa.compositePerMileUsd },
    { id: 'aaa_small_sedan', label: 'AAA small sedan', perMileUsd: aaa.smallSedanPerMileUsd },
    { id: 'aaa_medium_suv', label: 'AAA medium SUV', perMileUsd: aaa.mediumSuvPerMileUsd },
    { id: 'ogrp_micro_mobility', label: 'OGRP micro-mobility (operating)', perMileUsd: micro },
  ];

  const comparisons = tiers
    .filter((t) => t.id !== 'ogrp_micro_mobility')
    .map((t) => ({
      vehicleTier: t.label,
      perMileUsd: t.perMileUsd,
      microPerMileUsd: micro,
      ratioVehicleToMicro: t.perMileUsd / micro,
      savingsPerMileUsd: t.perMileUsd - micro,
    }));

  return {
    aaaSource: aaa.edition,
    annualMilesBasis: aaa.annualMiles,
    microMobilityAssumptions: {
      kwhPerMile: MICRO_MOBILITY_OPERATING.kwhPerMile,
      usdPerKwh: MICRO_MOBILITY_OPERATING.usdPerKwh,
      maintenancePerMileUsd: MICRO_MOBILITY_OPERATING.maintenancePerMileUsd,
    },
    tiers,
    comparisons,
    minRatioVehicleToMicro: Math.min(...comparisons.map((c) => c.ratioVehicleToMicro)),
  };
}

export function compareParkingCruising() {
  const legacy = UW_URBAN_FREIGHT_LAB.parkingCruisingFractionDeliveryVehicles;
  const ogrp = MICRO_MOBILITY_OPERATING.parkingCruisingFraction;
  const tripMinutes = 180;
  const legacyCruiseMin = tripMinutes * legacy;
  const ogrpCruiseMin = tripMinutes * ogrp;

  return {
    source: UW_URBAN_FREIGHT_LAB.source,
    legacyParkingCruiseFraction: legacy,
    ogrpParkingCruiseFraction: ogrp,
    assumedTripMinutes: tripMinutes,
    legacyCruiseMinutes: legacyCruiseMin,
    ogrpCruiseMinutes: ogrpCruiseMin,
    minutesSavedPerTrip: legacyCruiseMin - ogrpCruiseMin,
    pctTimeRecovered: legacy > 0 ? (legacyCruiseMin - ogrpCruiseMin) / tripMinutes : 0,
    avgParkingCruiseMinutesPerDayCited: UW_URBAN_FREIGHT_LAB.avgParkingCruiseMinutesPerDay,
  };
}

export function generosityGateBreakEven() {
  const floor = GAMMA_FLOOR_USD;
  const micro = MICRO_MOBILITY_OPERATING.operatingPerMileUsd;
  const aaa = AAA_DRIVING_COSTS_2025.compositePerMileUsd;

  const milesAtFloorMicro = floor / micro;
  const milesAtFloorAaa = floor / aaa;
  const netAfterMicroCost = floor - micro;
  const netAfterAaaCost = floor - aaa;

  return {
    gammaFloorUsd: floor,
    netYieldIfZeroMiles: {
      microMobility: netAfterMicroCost,
      aaaVehicle: netAfterAaaCost,
    },
    milesToConsumeEntireFloorOnOverhead: {
      microMobility: milesAtFloorMicro,
      aaaVehicle: milesAtFloorAaa,
    },
    policyNote: 'Transactions below floor rejected before route acceptance; surplus tipping not modeled in E4',
  };
}

export async function loadRenoCoreBbox() {
  const raw = await readFile(join(ROOT, 'data', 'reno_core_bbox.json'), 'utf8');
  return JSON.parse(raw);
}

export async function loadOgrpProtocol() {
  const raw = await readFile(join(ROOT, 'config', 'ogrp_protocol.json'), 'utf8');
  return JSON.parse(raw);
}

export function pointInBbox(lat, lon, bbox) {
  return (
    lat >= bbox.south &&
    lat <= bbox.north &&
    lon >= bbox.west &&
    lon <= bbox.east
  );
}

export async function validateDensityGate() {
  const bbox = await loadRenoCoreBbox();
  const sampleTrips = bbox.sampleTrips || [];
  const results = sampleTrips.map((t) => ({
    id: t.id,
    lat: t.lat,
    lon: t.lon,
    insideCore: pointInBbox(t.lat, t.lon, bbox),
  }));
  const allInside = results.length > 0 && results.every((r) => r.insideCore);
  return { bbox, sampleTrips: results, allSampleTripsInsideCore: allInside };
}

export function validateOgrpSchema(config) {
  const errors = [];
  if (config.protocol !== 'OmniversalGoldilocksRideshare') {
    errors.push('protocol must be OmniversalGoldilocksRideshare');
  }
  if (typeof config.egs_constant !== 'number' || Math.abs(config.egs_constant - 1.618) > 0.01) {
    errors.push('egs_constant must be ~1.618');
  }
  const ac = config.acceptance_criteria;
  if (!ac || ac.density_gate_min_density !== 'high_core') {
    errors.push('acceptance_criteria.density_gate_min_density must be high_core');
  }
  if (!ac || ac.value_floor_token_equivalent !== GAMMA_FLOOR_USD) {
    errors.push(`acceptance_criteria.value_floor_token_equivalent must be ${GAMMA_FLOOR_USD}`);
  }
  if (!ac || ac.sovereign_pacing_enabled !== true) {
    errors.push('acceptance_criteria.sovereign_pacing_enabled must be true');
  }
  return { valid: errors.length === 0, errors };
}
