# METHODOLOGY · The Reno Interpretation (Nested Spherical Mirror Lattice)

**Document ID:** `WP-SYNTHOBS-TBME-SUPERPOSITION-RENO-INTERPRETATION-2026-08-01`  
**Prior REV2:** `WP-SYNTHOBS-TBME-SUPERPOSITION-MIRROR-FULL-REV2-2026-08-01`  
**Protocol:** NSPFRNP-WP-EFL-2026-07

## Experiments

| ID | Computes | Refute |
|----|----------|--------|
| E1 | $\theta_{\mathrm{EGS}}=360/E_F^2$ | Mismatch vs golden angle |
| E2 | MAE(measured, predicted) on protocol table | MAE ≥ 0.05 |
| E3 | Mid $I_1\approx E_F/2$ | Mid ≈ 0.5 only |
| E4 | Angle variance ≫ Copenhagen flat | Flat series |
| E5 | Facet cardinality 81 | Count ≠ 81 |
| E6 | Round-trip restores 50/50 | Entropy/intensity loss |
| E7 | Optional lab JSON | skip if absent |
| E8 | Nested-shell odd tiers sum to 81 | Cardinality ≠ 81 |
| E9 | $R_n=(E_F-1)/(E_F+1)\approx 0.236$ | Coeff unrelated to $E_F$ |
| E10 | Reno rubric > Copenhagen | Ordering inverted |

No hardcoded “pass” without computation.
