import Init

namespace GoldilocksErdos.Util

theorem list_all_range {p : Nat → Bool} {n : Nat}
    (h : (List.range n).all p = true) {x : Nat} (hx : x < n) : p x = true := by
  have h' := (List.all_eq_true (l := List.range n) (p := p)).mp h
  exact h' x (List.mem_range.mpr hx)

end GoldilocksErdos.Util
