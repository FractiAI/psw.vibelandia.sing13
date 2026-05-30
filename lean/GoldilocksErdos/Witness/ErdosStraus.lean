import Mathlib.Tactic

namespace GoldilocksErdos.Witness

structure ESTriple where
  a : Nat
  b : Nat
  c : Nat
  ha : 0 < a
  hb : 0 < b
  hc : 0 < c

def ESTriple.valid (t : ESTriple) (n : Nat) : Prop :=
  4 * t.a * t.b * t.c = n * (t.a * t.b + t.b * t.c + t.c * t.a)

def ES (n : Nat) : Prop :=
  ∃ t : ESTriple, ESTriple.valid t n

def witness2 : ESTriple := { a := 1, b := 2, c := 2, ha := by decide, hb := by decide, hc := by decide }

theorem valid2 : ESTriple.valid witness2 2 := by
  unfold ESTriple.valid witness2
  decide

theorem es_base_2 : ES 2 := ⟨witness2, valid2⟩

def witness3 : ESTriple := { a := 1, b := 4, c := 12, ha := by decide, hb := by decide, hc := by decide }
theorem valid3 : ESTriple.valid witness3 3 := by unfold ESTriple.valid witness3; decide
theorem es_base_3 : ES 3 := ⟨witness3, valid3⟩

def witness4 : ESTriple := { a := 2, b := 3, c := 6, ha := by decide, hb := by decide, hc := by decide }
theorem valid4 : ESTriple.valid witness4 4 := by unfold ESTriple.valid witness4; decide
theorem es_base_4 : ES 4 := ⟨witness4, valid4⟩

def witness6 : ESTriple := { a := 2, b := 8, c := 24, ha := by decide, hb := by decide, hc := by decide }
theorem valid6 : ESTriple.valid witness6 6 := by unfold ESTriple.valid witness6; decide
theorem es_base_6 : ES 6 := ⟨witness6, valid6⟩

def witness12 : ESTriple := { a := 4, b := 21, c := 28, ha := by decide, hb := by decide, hc := by decide }
theorem valid12 : ESTriple.valid witness12 12 := by unfold ESTriple.valid witness12; decide
theorem es_base_12 : ES 12 := ⟨witness12, valid12⟩

theorem es_scale {d n : Nat} (hd : 0 < d) (h : ES n) : ES (d * n) := by
  rcases h with ⟨t, ht⟩
  refine ⟨⟨d * t.a, d * t.b, d * t.c, Nat.mul_pos hd t.ha, Nat.mul_pos hd t.hb, Nat.mul_pos hd t.hc⟩, ?_⟩
  unfold ESTriple.valid at ht ⊢
  calc
    4 * (d * t.a) * (d * t.b) * (d * t.c)
        = d ^ 3 * (4 * t.a * t.b * t.c) := by ring
    _ = d ^ 3 * (n * (t.a * t.b + t.b * t.c + t.c * t.a)) := by rw [ht]
    _ = (d * n) * ((d * t.a) * (d * t.b) + (d * t.b) * (d * t.c) + (d * t.c) * (d * t.a)) := by ring

/-- Parametric witness for `n = 4k + 3` (symmetric mod-4 identity). -/
def witnessMod4_3 (k : Nat) : ESTriple :=
  { a := (4 * k + 3) * (k + 1)
    b := 2 * k + 2
    c := 2 * k + 2
    ha := by
      apply Nat.mul_pos
      · omega
      · omega
    hb := by omega
    hc := by omega }

theorem validMod4_3 (k : Nat) : ESTriple.valid (witnessMod4_3 k) (4 * k + 3) := by
  unfold ESTriple.valid witnessMod4_3
  ring

/-- Parametric witness for `n = 3k + 2` (standard mod-3 identity). -/
def witnessMod3_2 (k : Nat) : ESTriple :=
  { a := 3 * k + 2
    b := k + 1
    c := (3 * k + 2) * (k + 1)
    ha := by omega
    hb := by omega
    hc := by
      apply Nat.mul_pos
      · omega
      · omega }

theorem validMod3_2 (k : Nat) : ESTriple.valid (witnessMod3_2 k) (3 * k + 2) := by
  unfold ESTriple.valid witnessMod3_2
  ring

theorem es_mod4_3 (n : Nat) (_hn : 2 ≤ n) (h4 : n % 4 = 3) : ES n := by
  refine ⟨witnessMod4_3 (n / 4), ?_⟩
  convert validMod4_3 (n / 4) using 1
  omega

theorem es_mod3_2 (n : Nat) (_hn : 2 ≤ n) (h3 : n % 3 = 2) : ES n := by
  refine ⟨witnessMod3_2 (n / 3), ?_⟩
  convert validMod3_2 (n / 3) using 1
  omega

def IsCoveredResidue (r : Nat) : Prop :=
  r = 0 ∨ r = 2 ∨ r = 3 ∨ r = 4 ∨ r = 5 ∨ r = 6 ∨ r = 7 ∨ r = 8 ∨ r = 9 ∨ r = 10 ∨ r = 11

def coveredResidue (r : Nat) : Bool :=
  match r with
  | 0 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 => true
  | _ => false

theorem coveredResidue_true_iff (r : Nat) (hr : r < 12) :
    coveredResidue r = true ↔ IsCoveredResidue r := by
  have hrs :
      r = 0 ∨ r = 1 ∨ r = 2 ∨ r = 3 ∨ r = 4 ∨ r = 5 ∨ r = 6 ∨ r = 7 ∨ r = 8 ∨ r = 9 ∨ r = 10 ∨
        r = 11 := by omega
  rcases hrs with h | h | h | h | h | h | h | h | h | h | h | h
  all_goals subst h; simp [coveredResidue, IsCoveredResidue]

theorem es_covered (n : Nat) (hn : 2 ≤ n) (hmod : IsCoveredResidue (n % 12)) : ES n := by
  rcases hmod with h | h | h | h | h | h | h | h | h | h | h
  · have h0 : n % 12 = 0 := h
    have h12 : 12 ∣ n := Nat.dvd_of_mod_eq_zero h0
    have heq : (n / 12) * 12 = n := by rw [Nat.mul_comm, Nat.mul_div_cancel' h12]
    exact heq ▸ es_scale (by omega) es_base_12
  · have h2m : n % 12 = 2 := h
    have h2 : 2 ∣ n := Nat.dvd_of_mod_eq_zero (by omega)
    have heq : (n / 2) * 2 = n := by rw [Nat.mul_comm, Nat.mul_div_cancel' h2]
    exact heq ▸ es_scale (by omega) es_base_2
  · have h3m : n % 12 = 3 := h
    have h3 : 3 ∣ n := Nat.dvd_of_mod_eq_zero (by omega)
    have heq : (n / 3) * 3 = n := by rw [Nat.mul_comm, Nat.mul_div_cancel' h3]
    exact heq ▸ es_scale (by omega) es_base_3
  · have h4m : n % 12 = 4 := h
    have h4 : 4 ∣ n := Nat.dvd_of_mod_eq_zero (by omega)
    have heq : (n / 4) * 4 = n := by rw [Nat.mul_comm, Nat.mul_div_cancel' h4]
    exact heq ▸ es_scale (by omega) es_base_4
  · have h5 : n % 12 = 5 := h
    have h3 : n % 3 = 2 := by omega
    exact es_mod3_2 n hn h3
  · have h6m : n % 12 = 6 := h
    have h6 : 6 ∣ n := Nat.dvd_of_mod_eq_zero (by omega)
    have heq : (n / 6) * 6 = n := by rw [Nat.mul_comm, Nat.mul_div_cancel' h6]
    exact heq ▸ es_scale (by omega) es_base_6
  · have h7 : n % 12 = 7 := h
    have h4 : n % 4 = 3 := by omega
    exact es_mod4_3 n hn h4
  · have h8m : n % 12 = 8 := h
    have h4 : 4 ∣ n := Nat.dvd_of_mod_eq_zero (by omega)
    have heq : (n / 4) * 4 = n := by rw [Nat.mul_comm, Nat.mul_div_cancel' h4]
    exact heq ▸ es_scale (by omega) es_base_4
  · have h9m : n % 12 = 9 := h
    have h3 : 3 ∣ n := Nat.dvd_of_mod_eq_zero (by omega)
    have heq : (n / 3) * 3 = n := by rw [Nat.mul_comm, Nat.mul_div_cancel' h3]
    exact heq ▸ es_scale (by omega) es_base_3
  · have h10m : n % 12 = 10 := h
    have h2 : 2 ∣ n := Nat.dvd_of_mod_eq_zero (by omega)
    have heq : (n / 2) * 2 = n := by rw [Nat.mul_comm, Nat.mul_div_cancel' h2]
    exact heq ▸ es_scale (by omega) es_base_2
  · have h11 : n % 12 = 11 := h
    have h3 : n % 3 = 2 := by omega
    exact es_mod3_2 n hn h3

theorem es_row256_covered (n : Nat) (hn : 2 ≤ n) (hmod : coveredResidue (n % 12) = true) : ES n := by
  have hr : n % 12 < 12 := Nat.mod_lt n (by decide)
  exact es_covered n hn ((coveredResidue_true_iff (n % 12) hr).mp hmod)

/-- Scale a witness along a covered proper divisor (Goldilocks mod-1 composite bridge). -/
theorem es_from_covered_divisor (n div mult : Nat) (_hn : 2 ≤ n) (hdiv : 2 ≤ div) (hmult : 0 < mult)
    (heq : n = div * mult) (hcov : coveredResidue (div % 12) = true) : ES n := by
  subst heq
  have h := @es_scale mult div hmult (es_row256_covered div hdiv hcov)
  rwa [Nat.mul_comm]

/-- First prime in the mod-12 residue class 1 (research seed · finite kernel witness). -/
def witness13 : ESTriple :=
  { a := 4, b := 18, c := 468, ha := by decide, hb := by decide, hc := by decide }

theorem valid13 : ESTriple.valid witness13 13 := by
  unfold ESTriple.valid witness13
  decide

theorem es_base_13 : ES 13 := ⟨witness13, valid13⟩

theorem es_pow13 : ∀ (k : Nat), 0 < k → ES (13 ^ k) := by
  intro k hk
  match k with
  | 0 => omega
  | 1 =>
    simp
    exact es_base_13
  | k + 2 =>
    have hk' : 0 < k + 1 := by omega
    have ih := es_pow13 (k + 1) hk'
    rw [Nat.pow_succ, Nat.mul_comm]
    exact es_scale (by decide) ih

/-- Mod-12 class 1 when a covered proper divisor exists, or the number is a power of 13. -/
theorem es_mod12_1 (n : Nat) (hn : 2 ≤ n) (_h1 : n % 12 = 1)
    (h : (∃ d k, 2 ≤ d ∧ 0 < k ∧ k < n ∧ n = d * k ∧ coveredResidue (d % 12) = true) ∨
      (∃ k, 0 < k ∧ n = 13 ^ k)) : ES n := by
  rcases h with ⟨d, k, hd, hk, _hklt, heq, hcov⟩ | ⟨k, hk, heq⟩
  · exact es_from_covered_divisor n d k hn hd hk heq hcov
  · rw [heq]; exact es_pow13 k hk

#print axioms es_row256_covered
#print axioms es_mod12_1

end GoldilocksErdos.Witness
