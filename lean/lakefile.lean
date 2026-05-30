import Lake
open Lake DSL

package «GoldilocksErdos» where
  leanOptions := #[
    ⟨`autoImplicit, false⟩,
    ⟨`relaxedAutoImplicit, false⟩
  ]

require mathlib from git
  "https://github.com/leanprover-community/mathlib4.git" @ "v4.14.0"

@[default_target]
lean_lib GoldilocksErdos where
  roots := #[`GoldilocksErdos]
