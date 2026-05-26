/**
 * Turner bison / radar pipeline — synthetic vs real feeds.
 *
 * Default (production): **no synthetic placeholders** — soil history must come from
 * Open-Meteo (historical forecast or ERA5 archive); fence coupling uses only real
 * NOAA Kp / OpenWebRX IQ when available (no hardcoded PLL floor, no sin gate fiction).
 *
 * Legacy narrative / dev: set `TURNER_ALLOW_SYNTHETIC=1` or `true` to restore prior
 * synthetic soil fallback, φ-squashed Kp floor, and spatial fence phase pattern.
 */
export function turnerAllowSynthetic() {
  const v = process.env.TURNER_ALLOW_SYNTHETIC;
  return v === '1' || v === 'true';
}
