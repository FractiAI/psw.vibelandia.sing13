import Init
import GoldilocksErdos.Util.ListRange

open GoldilocksErdos.Util

namespace GoldilocksErdos.Witness

def ap3In9 : List (Nat × Nat × Nat) :=
  (List.range 9).flatMap fun a =>
    (List.range 9).flatMap fun d =>
      if _ : 0 < d ∧ a + 2 * d < 9 then [(a, a + d, a + 2 * d)] else []

def hasMonoAP3Nat (col : Nat → Nat) : Bool :=
  ap3In9.any fun (a, b, c) => col a == col b && col b == col c

def coloring9 (code : Nat) : Nat → Nat := fun i =>
  if _ : i < 9 then
    if ((code >>> i) &&& 1) == 1 then 1 else 0
  else 0

def allColoringsPass : Bool :=
  (List.range 512).all fun code => hasMonoAP3Nat (coloring9 code)

set_option maxRecDepth 8192 in
theorem allColoringsPass_true : allColoringsPass = true := by native_decide

theorem vdW_2_3 (code : Nat) (hc : code < 512) :
    hasMonoAP3Nat (coloring9 code) = true := by
  have hall : (List.range 512).all (fun code => hasMonoAP3Nat (coloring9 code)) = true := by
    simpa [allColoringsPass] using allColoringsPass_true
  exact list_all_range hall hc

def ap3In8 : List (Nat × Nat × Nat) :=
  (List.range 8).flatMap fun a =>
    (List.range 8).flatMap fun d =>
      if _ : 0 < d ∧ a + 2 * d < 8 then [(a, a + d, a + 2 * d)] else []

def hasMonoAP3_8Nat (col : Nat → Nat) : Bool :=
  ap3In8.any fun (a, b, c) => col a == col b && col b == col c

def coloring8 (code : Nat) : Nat → Nat := fun i =>
  if _ : i < 8 then
    if ((code >>> i) &&& 1) == 1 then 1 else 0
  else 0

/-- Code 51 avoids monochromatic 3-AP on `{0,…,7}`; pattern `[1,1,0,0,1,1,0,0]`. -/
theorem vdW_2_3_lower : hasMonoAP3_8Nat (coloring8 51) = false := by
  native_decide

theorem van_der_waerden_W23 :
    (∀ code, code < 512 → hasMonoAP3Nat (coloring9 code) = true) ∧
      hasMonoAP3_8Nat (coloring8 51) = false :=
  ⟨fun code hc => vdW_2_3 code hc, vdW_2_3_lower⟩

#print axioms van_der_waerden_W23

end GoldilocksErdos.Witness
