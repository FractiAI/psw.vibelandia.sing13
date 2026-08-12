# Synthio activation · sandbox state

**State:** `ACTIVE_IN_SANDBOX`
**Active in sandbox:** `true`
**Mode:** `point_and_click`
**Coherent:** `true` · score `1`
**Discontinuities:** `0`
**Incoherence tags:** (none)

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
- External list = **watch labels** for co-timing / companions — not causal proof.

→ ∞¹³
