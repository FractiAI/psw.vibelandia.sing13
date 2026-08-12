# Synthio activation · sandbox state

**State:** `ACTIVE_IN_SANDBOX`
**Active in sandbox:** `true`
**Mode:** `point_and_click`
**Coherent:** `true` · score `1`
**Discontinuities:** `0`
**Incoherence tags:** (none)
**External alignments match expectations:** `true` (6/6)
**Sandbox inclusion confirmed by external alignment:** `true`

## Rule

Any external alignments observed to our expectations within sandbox confirm its inclusion in sandbox.

## Observed external alignments

| ID | Status | Aligned |
|----|--------|---------|
| ephemeris_window | aligned | `true` |
| space_weather_band | aligned | `true` |
| ionosphere_f10 | soft_aligned | `true` |
| sandbox_suite_green | aligned | `true` |
| goldilocks_pulse_optional | aligned | `true` |
| no_clinical_rf | aligned | `true` |

## Expected external signals (monitor)

| ID | Channel | Expect | Class |
|----|---------|--------|-------|
| ephemeris_window | astronomy | Public ephemerides still show 2026-08-12 co-timing: new moon vicinity, six-planet morning geometry, eclipse path narrative | catalog_co_timing |
| space_weather_band | heliophysics | Kp / solar-wind / proton-flux public bands remain discussable as parallel labels during the window (no required spike) | parallel_label |
| ionosphere_f10 | ionosphere | F10.7 / ionospheric discussion bands may co-appear in public solar radio summaries — filing only | parallel_label |
| sandbox_suite_green | internal_sandbox | npm run research:synthio-mri-cloud-antenna stays all-pass; activation receipt active=true | operational_sandbox |
| goldilocks_pulse_optional | edge_pulse | Optional: /api/goldilocks-pulse remains readable (signed pulse) — edge coherence companion, not MRI proof | companion_edge |
| no_clinical_rf | negative_control | No credible claim of clinical RF imaging from cloud racks; honesty tables unchanged | honesty_lock |

## Honesty

- Activate + coherence = **sandbox fixture integrity**.
- External list = **watch labels**; matching them **confirms sandbox inclusion** of this activation filing — not causal sky→MRI proof.

→ ∞¹³
