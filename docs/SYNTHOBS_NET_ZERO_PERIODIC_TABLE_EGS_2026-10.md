# Net Zero Expedition 002 — Periodic Table Complements: Group 13↔15 Electronegativity and Independent Property Survival

**The Net Zero Expedition Series · Expedition 002 · application companion (not ENGINE_SHELF) · Infinite Octave / SynthOBS · 31 October 2026**

| Field | Value |
|-------|--------|
| **Operator** | SynthOBS Autonomous Agent · Syntheverse Sandbox |
| **Document ID** | `WP-SYNTHOBS-NET-ZERO-PERIODIC-TABLE-EGS-2026-10-31` |
| **Registry ID** | `synthobs-net-zero-periodic-table-2026-10` |
| **Suite** | `research/synthobs-net-zero-periodic-table/` |
| **Standalone** | [`FractiAI/synthobs-net-zero-periodic-table`](https://github.com/FractiAI/synthobs-net-zero-periodic-table) |
| **Ship blog** | `/ship-blog/net-zero-periodic-table` |
| **Journey** | `/journey/net-zero-expedition` |
| **Slot** | **application companion (not ENGINE_SHELF)** |
| **Seed** | `20261031` · validation `202610312` |
| **Prior** | Expedition 001 · The Missing Half (`synthobs-net-zero-missing-half-2026-10`) |

---

## Honesty boundary

| Tier | Claims | Does not claim |
|------|--------|----------------|
| **Grammar (A)** | Group involution \(R(13)=15\) and valence \(3+5=8\) form a Net Zero complementary account flanking Group 14 | That Φ_EGS derives the periodic table |
| **Pauling pattern (B)** | Period-paired \(\Delta\chi=\chi_{15}-\chi_{13}\) is >0 for periods 2–6 with negative Spearman association vs period | Strict monotonicity through period 6 (Tl/Bi rebound allowed) |
| **Independent EN (C–D)** | Allen and Allred–Rochow \(\Delta\chi\) series remain sign-consistent and rank-concordant with Pauling | That any one EN scale is ontologically privileged |
| **Independent properties (E–F)** | \(\Delta\)IE1 tracks \(\Delta\chi\); covalent \(-\Delta r\) complements early periods | New wet-lab measurements or toxicology advice |
| **Null (G)** | Observed Pauling↔Allen concordance is uncommon under period-shuffle | Exact analytic p-values for n=5 |
| **Novel catalog** | Suite-framed observations NZ-PT-01…08 under Expedition 001 grammar | Absolute historical priority in chemistry literature |
| **Shelf** | Application companion | ENGINE_SHELF pin |
| **Contrast** | Distinct from Digit 4 · Be–O Soft Story companion | Replacing Be–O / 81-electron filings |

**Evidence classification:** Computational lab on tabulated literature values + Net Zero complementary-structure framing; not a new experimental chemistry campaign.

---

## Document ID

`WP-SYNTHOBS-NET-ZERO-PERIODIC-TABLE-EGS-2026-10-31` · Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · NSPFRNP · **not ENGINE_SHELF**

---

## Abstract

Expedition 002 applies the Complementary Structure Inference grammar from Net Zero Expedition 001 (*The Missing Half*) to the periodic table, focusing on period-paired **Group 13 (triel) ↔ Group 15 (pnictogen)** electronegativity differences.

**Questions.** Do \(\Delta\chi\) series exhibit a consistent period-dependent pattern? Does the pattern survive independent electronegativity scales and comparison with other chemical properties from independent tabulations? What novel observations does the Expedition 001 model newly frame?

**Findings (executed suite).** Octet complement grammar holds; Pauling \(\Delta\chi>0\) for all five period pairs with Spearman \(\rho(\mathrm{period},\Delta\chi)=-0.700\); Allen and Allred–Rochow \(\Delta\chi\) survive with high concordance; \(\Delta\)IE1 concordant; covalent-radius complement holds for periods 2–5; permutation null supports Pauling↔Allen concordance; **novel observation catalog NZ-PT-01…08 = 8/8 supported**. **E1–E8 = 8/8** (seed `20261031`).

**Slot.** Application companion — not ENGINE_SHELF.

---

## 1. Introduction · Net Zero vehicle

Founding directive (unchanged): **Find the complement. Establish the relationship. Account for the whole.**

Expedition 001 established complementary decomposition beyond mirror symmetry, asymmetric balance, and non-unique hidden completion. Expedition 002 drives that vehicle onto chemistry’s most familiar map: the periodic table, treating Group 13 and Group 15 as period-paired complementary accounts flanking Group 14.

---

## 2. Research questions

1. Can Group 13↔15 be expressed as a Net Zero complementary grammar (involution + octet accounting)?  
2. Do Pauling electronegativity differences \(\Delta\chi(p)=\chi_{15}(p)-\chi_{13}(p)\) show a consistent period-dependent pattern?  
3. Does that pattern survive on independent Allen and Allred–Rochow scales?  
4. Do independent properties (first ionization energy, covalent radius) show concordant complementary structure?  
5. What novel observations does the Expedition 001 model catalog when applied here?

---

## 3. Mathematical foundations

**Group involution.** \(R(13)=15\), \(R(15)=13\), \(R\circ R=\mathrm{id}\).

**Octet complementary accounting.** Valence electrons \(v_{13}=3\), \(v_{15}=5\) ⇒ \(v_{13}+v_{15}=8\).

**Period-paired difference.** For period \(p\in\{2,3,4,5,6\}\) and property scale \(S\),

\[
\Delta S(p)=S(E_{15,p})-S(E_{13,p}).
\]

**Pattern metrics.** Sign consistency (\(\Delta\chi>0\)); Spearman \(\rho\) vs period; cross-scale Spearman concordance; permutation null on shuffled Allen series.

---

## 4. Computational experiments (suite receipts)

| Exp | Result | Pass |
|-----|--------|------|
| A Grammar | Involution + valence sum 8 | ✓ |
| B Pauling | all \(\Delta\chi>0\); \(\rho=-0.700\) vs period | ✓ |
| C Allen | survives; high ρ vs Pauling | ✓ |
| D Allred–Rochow | survives; high ρ vs Pauling | ✓ |
| E ΔIE1 | concordant with Δχ; declines with period | ✓ |
| F −Δr | periods 2–5 G15 smaller; tracks Δχ | ✓ |
| G Permute | observed concordance uncommon under shuffle | ✓ |
| H Pin+catalog | application companion; NZ-PT 8/8 | ✓ |

Reproduce: `npm run research:synthobs-net-zero-periodic-table` · receipts in `research/synthobs-net-zero-periodic-table/data/`.

---

## 5. Novel observation catalog (Expedition 001 model)

| ID | Observation (suite-framed) |
|----|----------------------------|
| NZ-PT-01 | G13↔G15 involution + octet account flanking G14 |
| NZ-PT-02 | Pauling Δχ>0 with period-dependent attenuation (non-strict) |
| NZ-PT-03 | Allen scale survival + concordance |
| NZ-PT-04 | Allred–Rochow scale survival + concordance |
| NZ-PT-05 | ΔIE1 independent-property concordance |
| NZ-PT-06 | Covalent-radius geometric complement (P2–5; P6 soft edge) |
| NZ-PT-07 | Non-uniqueness: multi-scale completion vs single-scale artifact |
| NZ-PT-08 | Distributed cross-property Net Zero ledger for triel/pnictogen pairs |

Machine-readable: `data/novel_observations.json`. “Novel” = newly framed jointly under this model in this suite — not absolute historical priority.

---

## 6. Principal findings

1. Complementary Structure Inference maps cleanly onto period-paired G13↔G15.  
2. Electronegativity differences exhibit a consistent period-dependent pattern under stated metrics.  
3. The pattern survives two independent EN scales and tracks ionization-energy differences.  
4. Radius complements reinforce early periods; heavy-element period 6 remains the soft edge.  
5. The novel observation catalog records eight supported suite-framed claims.

---

## 7. Limitations · contrast · engine pin

**Limitations:** Tabulated literature values; n=5 period pairs; not a wet-lab campaign; not toxicology.

**Contrast:** Digit 4 · Be–O Soft Story remains a separate ENGINE_SHELF companion — this paper does not re-derive the table from Φ_EGS.

**Engine pin:** **Not ENGINE_SHELF.** Application companion on the Net Zero Expedition Series journey.

---

## 8. Conclusion

Expedition 002 shows that the Missing Half model yields a falsifiable, multi-source complementary ledger on the periodic table’s Group 13↔15 period pairs, with an explicit catalog of suite-framed novel observations.

**Journey:** `/journey/net-zero-expedition`

---

## References / corpus cross-links

1. Net Zero Expedition 001 · The Missing Half — `docs/SYNTHOBS_NET_ZERO_MISSING_HALF_EGS_2026-10.md`
2. Cordero et al., Dalton Trans. 2008 — covalent radii tabulation used in suite `R_COV_PM`
3. Allen L.C., electronegativity scale lineage (1989) — suite `ALLEN` values
4. Digit 4 · Be–O periodic rhyme (contrast companion) — `docs/SYNTHOBS_DIGIT4_BE_O_PERIODIC_RHYME_EGS_2026-09.md`
5. Suite receipts — `research/synthobs-net-zero-periodic-table/data/empirical_report.json`

→ ∞^∞
