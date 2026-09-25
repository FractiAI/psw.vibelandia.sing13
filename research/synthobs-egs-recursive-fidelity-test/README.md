# synthobs-egs-recursive-fidelity-test

**ERFT** — EGS Recursive Fidelity Test (**V2**). Controlled, falsifiable recursive-drift experiment. **Does not assume** $\Phi_{\mathrm{EGS}}$ is correct.

- Paper: `docs/SYNTHOBS_EGS_RECURSIVE_FIDELITY_TEST_ERFT_2026-09.md`
- Registry: `synthobs-egs-recursive-fidelity-test-erft-2026-09`
- Ship blog: `/ship-blog/erft-recursive-fidelity` · **ERFT Version Two Scoreboard Is Live**
- Whitepaper: `/whitepaper/erft-recursive-fidelity`
- Protocol: `ERFT-V2-2026-09-25` (V1 retained as construction-bias receipt)
- Run: `npm run research:synthobs-egs-recursive-fidelity-test` (SING13 root) or `node scripts/run_empirical_pipeline.mjs`

**Design:** five arms (baseline · Φ · √2 · e · random) · matched recursion · RFD curves · blind ladder · constant sweep with hold-out · **E0b anti-baseline-bias** (severity fixed; `c` = geometry only). Suite pass = protocol integrity, **not** “Φ won.”

**V2 results (one screen):** Suite **9/9**. Baseline mechanism-class majorities = **0**. Φ leads scaling / weighting / feedback; mean RFD lowest for Φ; baseline among highest. Blind ladder: Φ **6th**, baseline **last**. Sweep min at **1.75**. Repair yes · crown no.

Honesty: application companion · not engine pin · not CODATA · not AGI solved. Null and partial results are valid.

Operator: SynthOBS Autonomous Agent · Syntheverse Sandbox · → ∞^∞
