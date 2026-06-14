---
title: Roadmap
description: Where we are and where we're going — the phased plan to certify ForsVerifier.sol, with current status.
---

The north star: **a formal proof that `ForsVerifier.sol` correctly implements FORS+C recovery**, conditional on a small, explicit trusted base for Keccak semantics and the shape of its extern result. No cryptographic soundness claim — that's inherited from the FORS scheme, not re-proved.

We're certifying the *deployed hand-written contract* (**route B**: prove its inline-assembly refines a clean Lean model via EVMYulLean), not shipping a verified-by-construction replacement (route A). See [the task](/solean-learn/task/) for why, and [Workstreams](/solean-learn/project/workstreams/) for where each piece lives.

Status legend: ✅ done · 🔄 in progress · 🔜 next · ⏳ later

## Current checkpoint — 2026-06-14

**Phase 4 is complete, and the Verity obligation accounting is now 9 of 11
discharged with real Lean proofs.** `Bridge/Phase4.lean` exports
`phase4_forsRefines : ForsRefines`: the deployed verifier observable agrees with
the Lean `recoverRaw?` model on the exact ABI-representable input domain.

The proof closes all three branches: malformed length returns zero, failed
forced-zero grinding returns zero through the real `YulHalt` path, and acceptance
executes the hmsg prefix, all 25 FORS trees, roots compression, low-160 address
derivation, and final return. The deployed selector switch, ABI guards, and call
into `fun_recover` are now proved too: `dispatcher_routes_to_recover` is a
theorem, not an assumption. `lake build NiceTry` passes all 1172 modules.

**Verity `local_obligations` — 9 of 11 discharged (2026-06-14).** Every
keccak-transcript memory obligation (leaf, node, hmsg, roots, address) and both
Class-A calldata obligations (`raw_calldata`, `raw_abi_parse`) is now `proved`,
each backed by a real Lean theorem in `Bridge/KernelRefinement.lean` (new) or an
existing Bridge lemma whose `mstore`/`calldataload` chain matches the kernel
verbatim — no fabricated flags (the Verity `proved` marker is an unchecked label,
so each flip cites a real theorem). The 2 remaining (`full_verifier` /
`full_raw_verifier` — Class-C kernel-loop choreography) are **held as a documented
boundary**: the equivalent choreography is already proven for the *deployed*
contract (`tree_loop_run` + `Phase4Accept`, inside `phase4_forsRefines`), so
re-proving it for the auxiliary Verity kernel would duplicate that whole
induction on a reference artifact. See `Bridge/OBLIGATIONS.md` for the rationale.

Phase 5's main trust reduction has landed. The five bundled shape-specific
Keccak axioms are one generic `evm_keccak_transcript` assumption over a proved
canonical encoder; all three zero-padding specs and both word-codec facts are
now theorems. The generic Keccak numeric bound is also proved from a single
extern-shape assumption, `ffi_kec_size`. The final theorem now depends on exactly
two project axioms.

## Phase 0 — Onboarding & scoping ✅
- This learning guide (T1–T6) stood up.
- Kickoff decisions: **keccak is trusted**, this is a **tooling pivot** (work in verity + EVMYulLean, not by extending SoLean's DSL). See the [Project log](/solean-learn/reference/project-log/).

## Phase 1 — Audit & direction ✅
- **Audited the existing verity FORS model** (`NiceTry/Fors/`): the structural Lean proofs are **fully closed — zero `sorry`** (raw decode, forced-zero guard, 25-tree climb, roots compression, address derivation). Compiles to Yul + has a Foundry replay vs the hand-written contract. **11 open `local_obligations`** at the Verity→Yul boundary (9 since discharged — see Phase 4).
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

## Phase 4 — Full-contract execution: `ForsRefines` ✅
The shapes prove "each hash step is the right one." Phase 4 connects them to the **real interpreter running `ForsVerifier.sol`**.
- ✅ **`evmRun` built — and a vacuity bug caught & fixed.** It was running the dispatcher on an empty account map, so the `recover` call hit `MissingContract` and `evmRun ≡ 0` for every input (would have made the goal *false*). Fixed by installing the contract at `codeOwner`.
- ✅ **Refinement spine** (`Bridge/Refinement.lean`): `forsRefines_of_branches` reduces `ForsRefines` to three named interpreter facts — `h_len` / `h_guard` (reject paths → `address(0)`) and `h_accept` (the recovery happy path). Zero added trust.
- ✅ **Complete interpreter-stepping foundation**: every construct in the dispatcher + `fun_recover` has a `sorry`-free reduction lemma — control flow, all 14 pure builtins, the 7 stateful ops (`calldataload`/`mstore`/`keccak256`/`return`/`revert`/…), user-`call`/`switch`, and nested-expression composition (`Bridge/Interp*.lean`).
- ✅ **`calldataload` byte-reasoning library** (`Bridge/CalldataBytes.lean`): `readBytes` over `copySlice`+`ffi.zeroes` and extraction over `encodeForsCalldata`'s layout — proves `calldatasize = 2548`, selector `= 0x1aad75c5`, `calldataload 4 = 0x40`, `calldataload 36 = digest`, `calldataload 0x44 = raw.len`, and the payload chunk reads. Its padding and word-codec dependencies are now proved.
- ✅ **Dispatcher trace into early `fun_recover`** (`Bridge/ClassA*.lean`): the `recover(bytes,bytes32)` path symbolically executes through free-mem-ptr init, all selector/guard reads, `offset = 0x40`, `length = raw.len`, the good-length specialization to `SigLen`, `constant_FORS_SIG_LEN() = SigLen`, and the masked pkSeed/R/counter reads inside `fun_recover`.
- ✅ **Soundness scoping** (`Bridge/RawDomain.lean`): `ForsAbiInput` covers representable length, packed 16-byte fields, and a bytes32-sized digest. This is a correctness fix: the old length-only theorem was false for unbounded model `Nat` values because ABI encoding truncates them.
- ✅ **The full 25-tree loop is proved** (`Bridge/Tree*.lean`): symbolic execution of all six hashes per iteration, the loop invariant, pointer/index arithmetic, the 25-step induction, and all 25 root-buffer writes are closed end to end. The proof is `sorry`-free and uses only the documented trust surface.
- ✅ **Tree calldata/value glue is proved** (`Bridge/TreeCalldata.lean`): general payload-pair extraction, masked `calldataload` → `read16`, `RawSigWellFormed`, and closed-form `loopSk`/`loopSib` reads connect the interpreter's calldata words to the model openings.
- ✅ **Post-loop machinery is proved** (`Bridge/TreeFinal.lean`): roots-buffer concatenation, roots compression, address derivation, and the return-side statement machinery are available for final `h_accept` assembly.
- ✅ **Pre-loop support lemmas** (`Bridge/TreePreLoop.lean`): the padding-`mstore` calculus and five-word hmsg keccak window are proved.
- ✅ **Complete pre-loop statement trace** (`Bridge/TreeEntryFront.lean`): `exec_recover_hmsg_named` executes statements 18–24; `recoverHmsgDVal_toNat` proves the hmsg value; `exec_recover_preloop_to_loopInv` composes statements 18–31 and establishes `LoopInv 0`.
- ✅ **Header/model boundary glue**: pkSeed, R, counter, digest, and hmsg are connected to `decodeTyped raw`/`dValOf`; both forced-zero guard directions are proved.
- ✅ **`h_accept` assembled**: the real scoped call reaches the model address through the complete loop and post-loop return trace.
- ✅ **`h_len` / `h_guard` assembled**: malformed length and forced-zero rejection return `address(0)`.
- ✅ **Full deployed dispatcher route proved** (`Bridge/DispatcherRoute.lean`):
  exact selector/ABI-guard execution, eager switch composition, the
  `fun_recover(100, raw.len, digest)` call, and malformed-length revert/out-of-fuel
  outcomes. `dispatcher_routes_to_recover` is no longer an axiom.
- ✅ **Final theorem** (`Bridge/Phase4.lean`): `phase4_forsRefines : ForsRefines`.
- ✅ **9 of 11 `local_obligations` discharged** with real Lean theorems
  (`Bridge/KernelRefinement.lean` + existing Bridge lemmas), flipped
  `.assumed → .proved`: all keccak-transcript memory facts (leaf/node/hmsg/roots/address)
  and both Class-A calldata facts. The 2 Class-C kernel-loop choreography
  obligations are **held as a documented boundary** — the equivalent proof is
  already complete for the deployed contract.

## Phase 5 — Trust-surface reduction & upstream 🔄
- ✅ **Gap-B split complete:** `TranscriptEncoding.lean` defines the canonical
  byte encoding for every transcript field and proves address/hmsg/leaf/node/roots
  match the deployed EVM word sequences. `keccakHash16` and `keccakAddress` are
  proved masks of one shared opaque `keccakWord`; five bundled bridge axioms are
  replaced by one `evm_keccak_transcript`.
- ✅ **Padding and codec assumptions discharged:** `ffi_zeroes_{size,get!,eq_empty}`
  and `uint256_toByteArray_{size,roundtrip}` are kernel-checked theorems.
- ✅ **Keccak bound narrowed:** `ffi_kec_lt` is a theorem derived from the one
  FFI shape contract `(ffi.KEC b).size = 32`.
- 🔄 **Upstream hardening:** expose a public EVMYulLean word-codec theorem so the
  local proof no longer applies a private declaration by generated name; decide
  whether `ffi_kec_size` remains the explicit extern-C contract or is connected
  to a modeled Keccak implementation.

The current development branch declares **2 explicit labeled axioms**:
`evm_keccak_transcript` and `ffi_kec_size`. `phase4_forsRefines` depends on both.
Neither is a cryptographic-hardness claim; everything else checks to Lean's core.

## Phase 6 — SoLean integration & report ⏳
- Wire the proved FORS theorem into SoLean's `PQVerifierWrapper` (refine its placeholder `signature : UInt256` to a real `RawSig`).
- Final write-up + hand back to Antonio.

## External landscape — SPHINCS- Verity work

The newly published [SPHINCS- project](https://github.com/nconsigny/SPHINCS-/tree/main/verity)
proves substantially broader algorithmic verifiers: a full C13 keccak-based
SPHINCS- variant and an SLH-DSA SHA-2 verifier. That includes FORS/FORS+C plus
the WOTS+/hypertree layers absent from our current target.

The assurance boundaries differ. Their own Verity README says the Solidity
assembly is hand-transcribed into models that are not deployed, compiled into
the production contracts, or replayed against them; correspondence to production
rests on reviewing the transcription. Our project is narrower, but its route-B
goal is stronger at that boundary: symbolically execute the deployed
`ForsVerifier.sol` runtime in EVMYulLean and prove it refines the Lean FORS+C
model.

So this does **not** obsolete our work. It gives us:

- a useful independent full-scheme reference for FORS+C, WOTS+C, and hypertree
  structure;
- proof and parameterization patterns worth comparing or reusing;
- a sharper project claim: **deployed-code refinement for the FORS+C verifier**,
  complementary to their broader **hand-transcribed model-to-spec proof**.

---

**Now:** Phase 4 is complete on `agent/phase4-integration`, and 9 of 11 Verity
`local_obligations` are discharged with real Lean theorems (the 2 Class-C
kernel-loop choreography obligations are held as a documented boundary — already
proven for the deployed contract). `phase4_forsRefines` is green, and
`lake build NiceTry` passes all 1172 modules. Dispatcher routing and the
transcript-encoding/masking split are proved; all padding/codec facts are proved,
and the final theorem's project trust base is exactly
`evm_keccak_transcript + ffi_kec_size`. Phase 5 now focuses on upstream API
hardening and the long-term treatment of that extern shape contract. See `Bridge/PICKUP.md` and
`Bridge/OBLIGATIONS.md`.
