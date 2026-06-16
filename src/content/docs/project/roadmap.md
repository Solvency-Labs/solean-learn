---
title: Roadmap
description: Where we are and where we're going — the phased plan to certify ForsVerifier.sol, with current status.
---

The north star: **a formal proof that `ForsVerifier.sol` correctly implements FORS+C recovery**, conditional on a small, explicit trusted base for Keccak semantics and the shape of its extern result. The current theorem checks the pinned optimized-Yul artifact by parsing it into the EVMYulLean runtime that Lean executes. No cryptographic soundness claim: that is inherited from the FORS scheme, not re-proved.

We're certifying the hand-written verifier via **route B**: execute the optimized Yul produced from the real contract in EVMYulLean and prove it matches a clean Lean model, rather than shipping a verified-by-construction replacement (route A). See the [review path](/solean-learn/project/review-path/) for the shortest theorem path, [the verification report](/solean-learn/project/verification-report/) for the production claim, and [Workstreams](/solean-learn/project/workstreams/) for where each piece lives.

Status legend: ✅ done · 🔄 in progress · 🔜 next · ⏳ later

## Current checkpoint — 2026-06-16

**Production verdict: the verifier component is green, conditionally.** We can
rely on the pinned verifier after an exact deployed-bytecode match, provided the
wallet compares the recovered address with its current nonzero owner and the
signer enforces the FORS few-time-key lifecycle. This wording, the unsafe
nonzero-only pattern, and the full release checklist are now explicit in the
[verification report](/solean-learn/project/verification-report/).

**The review surface is now intentionally small.** `Bridge/ReviewSurface.lean`
exports:

```lean
pinned_yul_runtime_matches_recover_model :
  parseDeployedRuntime pinnedForsOptimizedYul = .ok forsVerifierRuntime ∧
    ∀ raw digest, ForsAbiInput raw digest →
      evmRunWithRuntime forsVerifierRuntime raw digest =
        recoverOrZero raw digest
```

That says the pinned optimized-Yul artifact parses to the exact runtime Lean
executes, and that runtime agrees with the clean FORS+C model on the exact
ABI-representable input domain.

The proof closes all three branches: malformed length returns zero, failed
forced-zero grinding returns zero through the real `YulHalt` path, and acceptance
executes the hmsg prefix, all 25 FORS trees, roots compression, low-160 address
derivation, and final return. The transcribed selector switch, ABI guards, and call
into `fun_recover` are now proved too: `dispatcher_routes_to_recover` is a
theorem, not an assumption. The full audit script regenerates the optimized Yul,
checks it byte-for-byte against the pinned artifact, builds the Lean target, and
prints the theorem assumptions.

**Do not confuse the real verifier with the helper verifier.** The real verifier
is `ForsVerifier.sol` → pinned optimized Yul → `forsVerifierRuntime`. That is
what the final theorem checks. The Verity-generated verifier is a helper version
used for cross-checking. Its checklist has 11 items: 9 are proved, and the
remaining 2 are about its own big 25-tree loop. We already proved that loop for
the real verifier, so those 2 helper-checklist items are not dependencies of the
main theorem. See the [review path](/solean-learn/project/review-path/) for the
plain version.

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

## Phase 4 — Full-runtime execution: `ForsRefines` ✅
The shapes prove "each hash step is the right one." Phase 4 connects them to
EVMYulLean executing the complete runtime imported from the pinned optimized-Yul
artifact.
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
- ✅ **Full dispatcher route proved** (`Bridge/DispatcherRoute.lean`):
  exact selector/ABI-guard execution, eager switch composition, the
  `fun_recover(100, raw.len, digest)` call, and malformed-length revert/out-of-fuel
  outcomes. `dispatcher_routes_to_recover` is no longer an axiom.
- ✅ **Final theorem** (`Bridge/Phase4.lean`): `phase4_forsRefines : ForsRefines`.
- ✅ **Reviewer theorem** (`Bridge/ReviewSurface.lean`):
  `pinned_yul_runtime_matches_recover_model`.
- ✅ **9 of 11 `local_obligations` discharged** with real Lean theorems
  (`Bridge/KernelRefinement.lean` + existing Bridge lemmas), flipped
  `.assumed → .proved`: all keccak-transcript memory facts (leaf/node/hmsg/roots/address)
  and both Class-A calldata facts. The 2 Class-C kernel-loop choreography
  obligations are **held as a documented boundary** — the equivalent proof is
  already complete for the parser-certified real runtime.

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

The current review theorem declares **2 explicit labeled project assumptions**:
`evm_keccak_transcript` and `ffi_kec_size`. Neither is a cryptographic-hardness
claim; everything else checks to Lean's core.

## Phase 6 — Antonio review & provenance closure 🔄
- ✅ Publish the [verification report](/solean-learn/project/verification-report/)
  and [review path](/solean-learn/project/review-path/) with a plain-English
  safety verdict, exact theorem, unsafe and safe caller patterns, ABI domain,
  two-item trust base, and production checklist.
- ✅ Add an exact deployed-bytecode checker. It compares the code at a supplied
  RPC address byte-for-byte with the pinned 1,064-byte runtime and its EVM code
  hash.
- 🔜 Run that checker against the actual production or candidate deployment.
  No deployment address has been recorded in this workspace yet.
- 🔄 Obtain Antonio's decision on the two Keccak boundary assumptions, pinned
  `solc`, and deployment-identity boundary.
- ⏳ SoLean wallet integration is deferred and is not part of Antonio's FORS
  verifier sign-off.

## External landscape — SPHINCS- Verity work

The newly published [SPHINCS- project](https://github.com/nconsigny/SPHINCS-/tree/main/verity)
proves substantially broader algorithmic verifiers: a full C13 keccak-based
SPHINCS- variant and an SLH-DSA SHA-2 verifier. That includes FORS/FORS+C plus
the WOTS+/hypertree layers absent from our current target.

The assurance boundaries differ. Their own Verity README says the Solidity
assembly is hand-transcribed into models that are not deployed, compiled into
the production contracts, or replayed against them; correspondence to production
rests on reviewing the transcription. Our project is narrower, but its route-B
result executes the complete parser-certified optimized-Yul runtime in
EVMYulLean, including dispatcher and reject paths, and proves it matches the
Lean FORS+C model. The remaining provenance boundaries are pinned `solc` and
deployed-bytecode identity.

So this does **not** obsolete our work. It gives us:

- a useful independent full-scheme reference for FORS+C, WOTS+C, and hypertree
  structure;
- proof and parameterization patterns worth comparing or reusing;
- a sharper project claim: **full-runtime refinement for the FORS+C verifier's
  parser-certified optimized-Yul runtime**,
  complementary to their broader **hand-transcribed model-to-spec proof**.

---

**Now:** the review theorem `pinned_yul_runtime_matches_recover_model` is green
on `main`. The pinned optimized-Yul artifact parses to the exact runtime Lean
executes, the full runtime agrees with the clean FORS+C model, and the project
trust base is exactly `evm_keccak_transcript + ffi_kec_size`. The helper Verity
verifier remains useful background, not a dependency of the final theorem. The
live remaining steps are checking the actual deployment address, accepting the
pinned compiler/Keccak boundaries, and keeping the surrounding wallet/signer
review separate from the verifier theorem.
