---
title: Roadmap
description: Where we are and where we're going — the phased plan to certify ForsVerifier.sol, with current status.
---

The north star: **a formal proof that `ForsVerifier.sol` correctly implements FORS+C recovery**, conditional on a small, explicit trusted base (keccak + a few EVM memory-primitive specs). No cryptographic soundness claim — that's inherited from the FORS scheme, not re-proved.

We're certifying the *deployed hand-written contract* (**route B**: prove its inline-assembly refines a clean Lean model via EVMYulLean), not shipping a verified-by-construction replacement (route A). See [the task](/solean-learn/task/) for why, and [Workstreams](/solean-learn/project/workstreams/) for where each piece lives.

Status legend: ✅ done · 🔄 in progress · 🔜 next · ⏳ later

## Phase 0 — Onboarding & scoping ✅
- This learning guide (T1–T6) stood up.
- Kickoff decisions: **keccak is trusted**, this is a **tooling pivot** (work in verity + EVMYulLean, not by extending SoLean's DSL). See the [Project log](/solean-learn/reference/project-log/).

## Phase 1 — Audit & direction ✅
- **Audited the existing verity FORS model** (`NiceTry/Fors/`): the structural Lean proofs are **fully closed — zero `sorry`** (raw decode, forced-zero guard, 25-tree climb, roots compression, address derivation). Compiles to Yul + has a Foundry replay vs the hand-written contract. **12 open `local_obligations`** at the Verity→Yul boundary.
- **All six open questions resolved** (see the log). Headline: target **spec-correctness conditional on trusted keccak**; **route B**.
- Scope + "what counts as verified" bar drafted for Antonio.

## Phase 2 — Composition interface (SoLean ⇄ FORS) ✅
- `Bridge/Oracle.lean` — the FORS recovery model **discharges SoLean's `Env.verifier` oracle** (proved).
- `Bridge/Equivalence.lean` — the `RefinesModel` target + **sufficiency theorem** (proved): hitting the EVM↔model refinement discharges everything downstream.

## Phase 3 — EVMYulLean equivalence: byte foundation + all shapes ✅
- **ByteArray lemma library** (proved): `byteArray_write_append` (one `mstore` = concat), `readWithPadding_exact` (what `keccak256` reads), `two_word_writes`, and **`writeWords32_data`** (the n-word generalization, reusable for every shape).
- **MachineState bridge** (proved): `mstore_memory`, `address_keccak_input` (EVM execution → exact keccak input bytes).
- **All five transcript shapes closed EVM→model**, real-contract-accurate (write-over-existing-memory): `address`, `hmsg`, `leaf`, `node` (with even/odd `climbLevel` sibling ordering), and the `roots`-compression input — each `*_derivation_eq_overwrite` ties the EVM keccak-and-mask to the model hash via a labeled `evm_keccak_*` axiom.
- **Roots → `recoverRoot` handoff skeleton** (proved): `roots_derivation_eq_recoverRoot_of_hash_chains_after_loop_buffer_init` — once the tree loop supplies the six per-tree hash results, the final compression already refines `recoverRoot`.
- `Bridge/MemoryLayout.lean` — Class-C layout/non-overlap facts (the contract's `_GUARD`s) (proved).
- Trust localized to **9 named axioms** (5 `evm_keccak_*` + 4 FFI/word specs); everything else checks to Lean's core. See [Workstreams → trust surface](/solean-learn/project/workstreams/#trust-surface).

## Phase 4 — Full-contract execution: `RefinesModel evmRun` 🔄
The shapes prove "each hash step is the right one." Phase 4 connects them to the **real interpreter running `ForsVerifier.sol`**.
- ✅ **`evmRun` built — and a vacuity bug caught & fixed.** It was running the dispatcher on an empty account map, so the `recover` call hit `MissingContract` and `evmRun ≡ 0` for every input (would have made the goal *false*). Fixed by installing the contract at `codeOwner`.
- ✅ **Refinement spine** (`Bridge/Refinement.lean`): `forsRefines_of_branches` reduces `ForsRefines` to three named interpreter facts — `h_len` / `h_guard` (reject paths → `address(0)`) and `h_accept` (the recovery happy path). Zero added trust.
- ✅ **Complete interpreter-stepping foundation**: every construct in the dispatcher + `fun_recover` has a `sorry`-free reduction lemma — control flow, all 14 pure builtins, the 7 stateful ops (`calldataload`/`mstore`/`keccak256`/`return`/`revert`/…), user-`call`/`switch`, and nested-expression composition (`Bridge/Interp*.lean`).
- ✅ **`calldataload` byte-reasoning library** (`Bridge/CalldataBytes.lean`): `readBytes` over `copySlice`+`ffi.zeroes` and extraction over `encodeForsCalldata`'s layout — proves `calldatasize = 2548`, selector `= 0x1aad75c5`, `calldataload 4 = 0x40`, `calldataload 36 = digest`, `calldataload 0x44 = raw.len`, and the payload chunk reads. Uses one new (pending-upstream) word-codec axiom.
- ✅ **Dispatcher trace into early `fun_recover`** (`Bridge/ClassA*.lean`): the `recover(bytes,bytes32)` path symbolically executes through free-mem-ptr init, all selector/guard reads, `offset = 0x40`, `length = raw.len`, the good-length specialization to `SigLen`, `constant_FORS_SIG_LEN() = SigLen`, and the masked pkSeed/R/counter reads inside `fun_recover`.
- 🛡️ **Soundness scoping** (`Bridge/RawDomain.lean`): refinement is stated over ABI-representable lengths (`raw.len < 2²⁵⁶`). This is a *fix*, not a weakening — without it the theorem is false (a `bytes.length` word truncates `raw.len mod 2²⁵⁶`, which could collide with `SigLen`). Real ABI calldata always satisfies it.
- 🔜 **Assemble `h_len` / `h_guard`**: finish the bad-length and forced-zero reject traces (`RETURN address(0)`) on top of the now-complete dispatcher foundation.
- ⏳ **The FORS tree-climb loop** (the intellectually hard core) → discharges `h_accept` by feeding the proved roots-handoff skeleton; induction over the 25-tree `for`-loop threading machine state.
- ⏳ **Discharge the 12 `local_obligations`** (flip `.assumed → .proved`).

## Phase 5 — Trust-surface reduction & upstream ⏳
- Split `evm_keccak_address` into a keccak-only axiom + a *proved* `encodeTranscript` masking lemma (Gap B).
- **Upstream PR** to `lfglabs-dev/EVMYulLean` de-privatizing `toBytes'_le` / `fromBytes'_toBytes'`, to discharge **both** word-codec axioms (`uint256_toByteArray_size` and the new `uint256_toByteArray_roundtrip`). Trust base is currently **10 labeled axioms** (5 keccak shapes + 3 FFI memory-padding + 2 word-codec, the last two pending this PR).

## Phase 6 — SoLean integration & report ⏳
- Wire the proved FORS theorem into SoLean's `PQVerifierWrapper` (refine its placeholder `signature : UInt256` to a real `RawSig`).
- Final write-up + hand back to Antonio.

---

**Now:** Phase 3 fully landed; Phase 4 well underway. `evmRun` runs the real contract (post bug-fix), the goal is reduced to three named facts, the **entire interpreter-stepping toolkit is built**, and the **calldata byte library + dispatcher trace into early `fun_recover` are now proven** (with a soundness scoping fix for ABI-representable lengths). What remains: **assemble `h_len`/`h_guard`** (finish the reject traces — mechanical on the existing foundation) and the **tree-climb loop** for `h_accept` (the hard core, best as a dedicated focused effort, one owner). Full breakdown in the repo's `Bridge/PICKUP.md`. Claim a workstream on the [Project log](/solean-learn/reference/project-log/).
