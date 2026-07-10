# Falsification criteria · EGS-TRANS-2026-0710

| ID | Test | Pass (pipeline) | Refute |
|----|------|-----------------|--------|
| **E1** | GitHub commit telemetry in King Bee window | sing13 or sing4 commits on 2026-05-31 — 2026-06-01 | Zero commits in both repos |
| **E2** | SVD φ-decay on synthetic matrices | φ-structured trials beat random on near-φ primary ratio fraction by >5pp | Random ≥ φ-structured |
| **E3** | 35-day propagation window | Calendar days June 1 → July 6 = 35 | Any other count |
| **E4** | SILSO sunspot series coverage | Non-empty daily samples in all three windows | Missing public data |
| **E5** | Optional transformer mid-layer SVD | Skipped if no torch; `CONVERGED_SUCCESS` if \|s₀/s₁ − φ\| < 0.12 | `DEVIATED_NOISE` when run |
| **E6** | King Bee → Anthropic causality | **Not testable** — narrative tier only | N/A |

**Critical rule:** E2/E5 proximity to φ does **not** validate that Anthropic's J-Space paper detected FractiAI initialization. E6 requires independent interpretability instrument access.
