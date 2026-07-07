/** EGS fractal constant Φ = (1+√5)/2 */
export const PHI_EGS = (1 + Math.sqrt(5)) / 2;

/**
 * AAA Your Driving Costs — 2025/2026 edition (15,000 mi/yr basis).
 * Values from OGRP paper cross-analysis; verify against current AAA release.
 * @see https://newsroom.aaa.com/tag/your-driving-costs/
 */
export const AAA_DRIVING_COSTS_2025 = {
  edition: 'AAA Your Driving Costs 2025/2026',
  annualMiles: 15000,
  compositeAnnualUsd: 11577,
  compositePerMileUsd: 11577 / 15000,
  smallSedanPerMileUsd: 0.5587,
  mediumSuvPerMileUsd: 0.8389,
  sourceNote: 'AAA composite and vehicle-class tables — operating cost incl. depreciation, fuel, insurance, registration',
};

/**
 * UW Urban Freight Lab — dense urban delivery parking cruising.
 * Literature anchor: ~28% of trip time cruising for parking; ~50 min/day cited in urban freight studies.
 */
export const UW_URBAN_FREIGHT_LAB = {
  source: 'University of Washington Urban Freight Lab',
  parkingCruisingFractionDeliveryVehicles: 0.28,
  avgParkingCruiseMinutesPerDay: 50,
  sourceNote: 'Dense urban core delivery vehicles — published freight lab summaries',
};

/**
 * OGRP micro-mobility operating cost model (electric scooter / e-bike, operating-only).
 * electricity_kwh_per_mile * $/kWh + maintenance_amortization_per_mile
 */
export const MICRO_MOBILITY_OPERATING = {
  kwhPerMile: 0.03,
  usdPerKwh: 0.12,
  maintenancePerMileUsd: 0.0014,
  get operatingPerMileUsd() {
    return this.kwhPerMile * this.usdPerKwh + this.maintenancePerMileUsd;
  },
  parkingCruisingFraction: 0,
  vector: 'electric micro-mobility (e-scooter / e-bike)',
};

/** Generosity gate floor (USD) */
export const GAMMA_FLOOR_USD = 9.0;

/** OGRP protocol reference config filename */
export const OGRP_CONFIG_FILE = 'ogrp_protocol.json';
