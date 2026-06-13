---
title: Roadmap
description: Where we are and where we're going — the phased plan to certify ForsVerifier.sol, with current status.
---

The north star: **a formal proof that `ForsVerifier.sol` correctly implements FORS+C recovery**, conditional on a small, explicit trusted base (keccak + a few EVM memory-primitive specs). No cryptographic soundness claim — that's inherited from the FORS scheme, not re-proved.

We're certifying the *deployed hand-written contract* (**route B**: prove its inline-assembly refines a clean Lean model via EVMYulLean), not shipping a verified-by-construction replacement (route A). See [the task](/solean-learn/task/) for why, and [Workstreams](/solean-learn/project/workstreams/) for where each piece lives.

Status legend: ✅ done · 🔄 in progress · 🔜 next · ⏳ later

## Current checkpoint — 2026-06-13

The difficult interpreter proof is no longer the tree induction: the real
25-iteration loop is proved. Work stopped immediately before the remaining
pre-loop statement trace. The next theorem must execute
`fun_recover.body[18:32]`, establish the hmsg value and forced-zero skip, perform
the padding store at `0x380`, initialize the loop variables, and produce
`LoopInv 0`. That state feeds the proved loop and post-loop machinery to assemble
`h_accept`.

## Phase 0 — Onboarding & scoping ✅
- This learning guide (T1–T6) stood up.
- Kickoff decisions: **keccak is trusted**, this is a **tooling pivot** (work in verity + EVMYulLean, not by extending SoLean's DSL). See the [Project log](/solean-learn/reference/project-log/).

## Phase 1 — Audit & direction ✅
- **Audited the existing verity FORS model** (`NiceTry/Fors/`): the structural Lean proofs are **fully closed — zero `sorry`** (raw decode, forced-zero guard, 25-tree climb, roots compression, address derivation). Compiles to Yul + has a Foundry replay vs the hand-written contract. **12 open `local_obligations`** at the Verity→Yul boundary.
- **Technical direction resolved** (see the log). Headline: target **spec-correctness conditional on trusted keccak**; **route B**.
- Scope + "what counts as verified" bar drafted for Antonio.
- Antonio's final sign-off on route B and the verification bar remains pending.

## Phase 2 — Composition interface (SoLean ⇄ FORS) ✅
- `Bridge/Oracle.lean` — the FORS recovery model **discharges SoLean's `Env.verifier` oracle** (proved).
- `Bridge/Equivalence.lean` — the `RefinesModel` target + **sufficiency theorem** (proved): hitting the EVM↔model refinement discharges everything downstream.

## Phase 3 — EVMYulLean equivalence: byte foundation + all shapes ✅
- **ByteArray lemma library** (proved): `byteArray_write_append` (one `mstore` = concat), `readWithPadding_exact` (what `keccak256` reads), `two_word_writes`, and **`writeWords32_data`** (the n-word generalization, reusable for every shape).
- **MachineState bridge** (proved): `mstore_memory`, `address_keccak_input` (EVM execution → exact keccak input bytes).
- **All five transcript shapes closed EVM→model**, real-contract-accurate (write-over-existing-memory): `address`, `hmsg`, `leaf`, `node` (with even/odd `climbLevel` sibling ordering), and the `roots`-compression input — each `*_derivation_eq_overwrite` ties the EVM keccak-and-mask to the model hash via a labeled `evm_keccak_*` axiom.
- **Roots → `recoverRoot` handoff** (proved): `roots_derivation_eq_recoverRoot_of_hash_chains_after_loop_buffer_init` rewrites the six per-tree hash-chain results into the model's final root recovery. The loop now proves those chain values; final execution composition remains.
- `Bridge/MemoryLayout.lean` — Class-C layout/non-overlap facts (the contract's `_GUARD`s) (proved).

## Phase 4 — Full-contract execution: `RefinesModel evmRun` 🔄
The shapes prove "each hash step is the right one." Phase 4 connects them to the **real interpreter running `ForsVerifier.sol`**.
- ✅ **`evmRun` built — and a vacuity bug caught & fixed.** It was running the dispatcher on an empty account map, so the `recover` call hit `MissingContract` and `evmRun ≡ 0` for every input (would have made the goal *false*). Fixed by installing the contract at `codeOwner`.
- ✅ **Refinement spine** (`Bridge/Refinement.lean`): `forsRefines_of_branches` reduces `ForsRefines` to three named interpreter facts — `h_len` / `h_guard` (reject paths → `address(0)`) and `h_accept` (the recovery happy path). Zero added trust.
- ✅ **Complete interpreter-stepping foundation**: every construct in the dispatcher + `fun_recover` has a `sorry`-free reduction lemma — control flow, all 14 pure builtins, the 7 stateful ops (`calldataload`/`mstore`/`keccak256`/`return`/`revert`/…), user-`call`/`switch`, and nested-expression composition (`Bridge/Interp*.lean`).
- ✅ **`calldataload` byte-reasoning library** (`Bridge/CalldataBytes.lean`): `readBytes` over `copySlice`+`ffi.zeroes` and extraction over `encodeForsCalldata`'s layout — proves `calldatasize = 2548`, selector `= 0x1aad75c5`, `calldataload 4 = 0x40`, `calldataload 36 = digest`, `calldataload 0x44 = raw.len`, and the payload chunk reads. Uses one new (pending-upstream) word-codec axiom.
- ✅ **Dispatcher trace into early `fun_recover`** (`Bridge/ClassA*.lean`): the `recover(bytes,bytes32)` path symbolically executes through free-mem-ptr init, all selector/guard reads, `offset = 0x40`, `length = raw.len`, the good-length specialization to `SigLen`, `constant_FORS_SIG_LEN() = SigLen`, and the masked pkSeed/R/counter reads inside `fun_recover`.
- 🛡️ **Soundness scoping** (`Bridge/RawDomain.lean`): refinement is stated over ABI-representable lengths (`raw.len < 2²⁵⁶`). This is a *fix*, not a weakening — without it the theorem is false (a `bytes.length` word truncates `raw.len mod 2²⁵⁶`, which could collide with `SigLen`). Real ABI calldata always satisfies it.
- ✅ **The full 25-tree loop is proved** (`Bridge/Tree*.lean`): symbolic execution of all six hashes per iteration, the loop invariant, pointer/index arithmetic, the 25-step induction, and all 25 root-buffer writes are closed end to end. The proof is `sorry`-free and uses only the documented trust surface.
- ✅ **Tree calldata/value glue is proved** (`Bridge/TreeCalldata.lean`): general payload-pair extraction, masked `calldataload` → `read16`, `RawSigWellFormed`, and closed-form `loopSk`/`loopSib` reads connect the interpreter's calldata words to the model openings.
- ✅ **Post-loop machinery is proved** (`Bridge/TreeFinal.lean`): roots-buffer concatenation, roots compression, address derivation, and the return-side statement machinery are available for final `h_accept` assembly.
- ✅ **Pre-loop support lemmas** (`Bridge/TreePreLoop.lean`): the padding-`mstore` calculus and five-word hmsg keccak window are proved.
- 🔄 **Pre-loop statement trace**: execute `fun_recover` statements 18–31 and establish `LoopInv 0` at the loop entry. This is the exact current stopping point.
- 🔜 **Assemble `h_accept`**: compose the new pre-loop trace with the proved loop, calldata/value glue, and post-loop machinery.
- 🔜 **Assemble `h_len` / `h_guard`**: finish the bad-length and forced-zero reject traces (`RETURN address(0)`) on top of the dispatcher foundation.
- ⏳ **Discharge the 12 `local_obligations`** (flip `.assumed → .proved`).

## Phase 5 — Trust-surface reduction & upstream ⏳
- Split all five `evm_keccak_*` bridges into keccak-only axioms plus proved transcript encoding/masking lemmas (Gap B).
- **Upstream PR** to `lfglabs-dev/EVMYulLean` exposing the private word-codec lemmas and a keccak-size fact, to discharge `uint256_toByteArray_size`, `uint256_toByteArray_roundtrip`, and `ffi_kec_lt`.
- Finish interpreter fuel/switch composition and replace the temporary `dispatcher_routes_to_recover` axiom with a theorem.

The current development branch has **12 explicit labeled axioms**: 5
keccak-shape bridges, 3 FFI padding specs, 2 word-codec specs, 1 keccak-output
bound, and 1 temporary dispatcher-routing assumption. None is a cryptographic
hardness assumption; everything else checks to Lean's core.

## Phase 6 — SoLean integration & report ⏳
- Wire the proved FORS theorem into SoLean's `PQVerifierWrapper` (refine its placeholder `signature : UInt256` to a real `RawSig`).
- Final write-up + hand back to Antonio.

---

**Now:** Phase 3 is complete and the hard core of Phase 4 has landed. The exact next task is the statement trace for `fun_recover.body[18:32]`; no part of that trace has been claimed as complete. After it establishes `LoopInv 0`, the proved loop and post-loop results can be composed into `h_accept`. The remaining critical path is then `h_len`/`h_guard`, dispatcher-routing proof, and the 12 Verity accounting obligations. Current work is on `agent/tree-loop-A2`, ahead of `evmrun-runtime`; see `Bridge/PICKUP.md`.
