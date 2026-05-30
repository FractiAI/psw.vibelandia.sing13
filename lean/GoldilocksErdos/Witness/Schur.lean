import Init
import GoldilocksErdos.Util.ListRange

open GoldilocksErdos.Util

namespace GoldilocksErdos.Witness

def schurTriples5 : List (Nat × Nat × Nat) :=
  [(1, 1, 2), (1, 2, 3), (1, 3, 4), (1, 4, 5), (2, 1, 3), (2, 2, 4), (2, 3, 5),
   (3, 1, 4), (3, 2, 5), (4, 1, 5)]

def hasMonoSchur5Nat (col : Nat → Nat) : Bool :=
  schurTriples5.any fun (x, y, z) =>
    col (x - 1) == col (y - 1) && col (y - 1) == col (z - 1)

def coloring5 (code : Nat) : Nat → Nat := fun i =>
  if _ : i < 5 then
    if ((code >>> i) &&& 1) == 1 then 1 else 0
  else 0

def allSchur5Pass : Bool :=
  (List.range 32).all fun code => hasMonoSchur5Nat (coloring5 code)

set_option maxRecDepth 8192 in
theorem allSchur5Pass_true : allSchur5Pass = true := by native_decide

theorem schur5_code (code : Nat) (hc : code < 32) :
    hasMonoSchur5Nat (coloring5 code) = true := by
  have hall : (List.range 32).all (fun code => hasMonoSchur5Nat (coloring5 code)) = true := by
    simpa [allSchur5Pass] using allSchur5Pass_true
  exact list_all_range hall hc

def schurTriples4 : List (Nat × Nat × Nat) :=
  [(1, 1, 2), (1, 2, 3), (1, 3, 4), (2, 1, 3), (2, 2, 4), (3, 1, 4)]

def hasMonoSchur4Nat (col : Nat → Nat) : Bool :=
  schurTriples4.any fun (x, y, z) =>
    col (x - 1) == col (y - 1) && col (y - 1) == col (z - 1)

def coloring4 (code : Nat) : Nat → Nat := fun i =>
  if _ : i < 4 then
    if ((code >>> i) &&& 1) == 1 then 1 else 0
  else 0

/-- Code 6 is a 2-coloring of `{1,…,4}` with no monochromatic `x+y=z`. -/
theorem schur4_counter : hasMonoSchur4Nat (coloring4 6) = false := by native_decide

/-- Two-color Schur number `S(2) = 5`: every 2-coloring of `{1,…,5}` has a mono triple. -/
theorem schur_S2 :
    (∀ code, code < 32 → hasMonoSchur5Nat (coloring5 code) = true) ∧
      hasMonoSchur4Nat (coloring4 6) = false :=
  ⟨fun code hc => schur5_code code hc, schur4_counter⟩

#print axioms schur_S2

end GoldilocksErdos.Witness
