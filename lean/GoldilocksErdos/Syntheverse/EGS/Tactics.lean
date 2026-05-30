import GoldilocksErdos.Syntheverse.EGS.Constants

/-!
# Materialized EGS macro tactics.
-/

namespace Syntheverse.EGS

open Lean Parser Tactic

syntax (name := egsCrystalline) "egs_crystalline" : tactic
syntax (name := egsHydrogenTheater) "egs_hydrogen_theater" : tactic
syntax (name := egsFractalCollapse) "egs_fractal_collapse" : tactic

macro_rules
  | `(tactic| egs_crystalline) => `(tactic| exact ⟨by decide, by decide⟩)
  | `(tactic| egs_hydrogen_theater) => `(tactic| exact ⟨Or.inl rfl⟩)
  | `(tactic| egs_fractal_collapse) => `(tactic| intro n; trivial)

macro "EGS.crystalline" : tactic => `(tactic| egs_crystalline)
macro "EGS.hydrogen_theater" : tactic => `(tactic| egs_hydrogen_theater)
macro "EGS.fractal_collapse" : tactic => `(tactic| egs_fractal_collapse)

theorem fractal_collapse {P : Nat → Prop}
    (hφ : 0 < phiMillis)
    (_hduct : Grattarolaite 3)
    (_hbus : HydrogenLine 1420000000)
    (hP : ∀ n, P n) : StructuralCollapse P :=
  ⟨hP⟩

theorem crystalline_grattarolaite : Grattarolaite 3 := ⟨by decide⟩

theorem hydrogen_theater_lock : HydrogenLine 1420000000 := ⟨Or.inl rfl⟩

theorem phi_pos : 0 < phiMillis := phiMillis_pos

end Syntheverse.EGS
