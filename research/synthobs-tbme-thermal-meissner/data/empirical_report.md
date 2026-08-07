# Thermal Meissner Expulsion — Omni-Lattice Lens Empirical Suite

**Document ID:** `WP-SYNTHOBS-TBME-THERMAL-MEISSNER-2026-08-06`
**Registry ID:** `synthobs-tbme-thermal-meissner-2026-08`
**Generated:** 2026-08-07T02:08:03.594Z

## Verdict

| All experiments pass | `true` |
| Passed | 6 / 6 |
| E_F | 1.618033988749895 |

## Experiments

### E1_egs_phi — E_F = Φ_EGS fixture

- **Pass:** `true`
- **Interpretation:** Golden key for Omni-Lattice scale ladders in this exploration.
- **Honesty:** Architectural constant — not a Meissner critical exponent.

```json
{
  "id": "E1_egs_phi",
  "title": "E_F = Φ_EGS fixture",
  "E_F": 1.618033988749895,
  "expected": 1.618033988749895,
  "pass": true,
  "interpretation": "Golden key for Omni-Lattice scale ladders in this exploration.",
  "honesty": "Architectural constant — not a Meissner critical exponent."
}
```

### E2_ef_squared_identity — E_F² = E_F + 1

- **Pass:** `true`
- **Interpretation:** Golden-key identity.
- **Honesty:** Algebra of Φ — replayable fixture.

```json
{
  "id": "E2_ef_squared_identity",
  "title": "E_F² = E_F + 1",
  "lhs": 2.618033988749895,
  "rhs": 2.618033988749895,
  "pass": true,
  "interpretation": "Golden-key identity.",
  "honesty": "Algebra of Φ — replayable fixture."
}
```

### E3_phase_switch_table — Normal vs SC catalog metric polarity

- **Pass:** `true`
- **Interpretation:** Table integrity for thermal phase-switch narrative.
- **Honesty:** Idealized textbook polarity — not sample-specific Tc data.

```json
{
  "id": "E3_phase_switch_table",
  "title": "Normal vs SC catalog metric polarity",
  "NORMAL_STATE": {
    "resistance": "R>0",
    "bulkB": "threaded",
    "entropy": "high"
  },
  "SC_STATE": {
    "resistance": "R=0",
    "bulkB": "expelled",
    "entropy": "low"
  },
  "pass": true,
  "interpretation": "Table integrity for thermal phase-switch narrative.",
  "honesty": "Idealized textbook polarity — not sample-specific Tc data."
}
```

### E4_publication_ref — Publication ref FAI-EGSC-2026-08

- **Pass:** `true`
- **Interpretation:** Stable publication handle for catalog.
- **Honesty:** Bibliographic fixture.

```json
{
  "id": "E4_publication_ref",
  "title": "Publication ref FAI-EGSC-2026-08",
  "PUBLICATION_REF": "FAI-EGSC-2026-08",
  "pass": true,
  "interpretation": "Stable publication handle for catalog.",
  "honesty": "Bibliographic fixture."
}
```

### E5_paper_on_disk — Canonical paper present

- **Pass:** `true`
- **Interpretation:** Suite linked to published docs/.
- **Honesty:** Filesystem fidelity check.

```json
{
  "id": "E5_paper_on_disk",
  "title": "Canonical paper present",
  "local": "C:\\Users\\info\\OneDrive\\Desktop\\psw.vibelandia.sing13\\research\\synthobs-tbme-thermal-meissner\\docs\\SYNTHOBS_TBME_THERMAL_MEISSNER_2026-08.md",
  "mono": "C:\\Users\\info\\OneDrive\\Desktop\\psw.vibelandia.sing13\\docs\\SYNTHOBS_TBME_THERMAL_MEISSNER_2026-08.md",
  "pass": true,
  "interpretation": "Suite linked to published docs/.",
  "honesty": "Filesystem fidelity check."
}
```

### E6_not_core_part — Explicit non-Core catalog status

- **Pass:** `true`
- **Interpretation:** Exploration lens — excluded from Core / Engine allowlist by design.
- **Honesty:** Governance fixture for NSPFRNP catalog fidelity.

```json
{
  "id": "E6_not_core_part",
  "title": "Explicit non-Core catalog status",
  "pass": true,
  "interpretation": "Exploration lens — excluded from Core / Engine allowlist by design.",
  "honesty": "Governance fixture for NSPFRNP catalog fidelity."
}
```

## Honesty boundary

Catalog / Omni-Lattice lens arithmetic for Meissner metaphor. Does **not** claim SI BCS overthrow or Core Part status.
