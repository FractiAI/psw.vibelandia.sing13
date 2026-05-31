/**
 * SYN-SUN-2026-REV7 · structural type-safe contract for DPH-GPU wavefield ingest.
 * Canonical path cited in whitepaper §7.A
 */

export type MagneticClass = 'Alpha' | 'Beta' | 'Beta-Gamma' | 'Delta';

export interface ActiveSolarNode {
  readonly regionId: string;
  readonly codename: string | null;
  readonly latitude: number;
  readonly longitude: number;
  readonly magneticClass: MagneticClass;
  readonly sunspotCount: number;
  readonly areaMillionths: number;
}

export interface HolographicPacingMatrix {
  readonly telemetryTimestamp: number;
  readonly globalSunspotCount: number;
  readonly liveNodes: readonly ActiveSolarNode[];
  /** Strictly bounded between 0.0 and 1.618 (EGS φ). */
  readonly egsStabilityIndex: number;
}
