---
title: Changelog
description: Dated, team-facing updates — what shipped, what changed, what's next. Newest first.
---

Bigger-picture than the append-only [Project log](/solean-learn/reference/project-log/) (which is decisions + open questions). This is the "what happened and what it means for you" feed.

## 2026-06-16 — review path simplified around the real verifier

The learning site now mirrors the NiceTry reviewer package. The theorem to read
first is `pinned_yul_runtime_matches_recover_model` in `ReviewSurface.lean`:
the pinned optimized-Yul artifact parses to the exact runtime Lean executes, and
that runtime agrees with the clean FORS+C recovery model.

The new [review path](/solean-learn/project/review-path/) explains the full route
without assuming repo context: clean model → pinned optimized Yul → EVMYulLean
execution → final comparison. It also makes the easy-to-mix-up part explicit:
the Verity-generated verifier is a helper/reference version, not the deployed
runtime theorem.

## 2026-06-14 — safety verdict and deployment gate made explicit

The Antonio-facing material now answers the practical question directly:
the pinned FORS verifier is suitable as a production recovery component after
the deployment and integration checklist passes.

The report explains that `recover` returns an address rather than a boolean.
Accepting any nonzero result is unsafe; callers must compare the result with the
current owner. It also separates what Lean proves from the remaining bytecode,
digest, signer, key-rotation, Keccak, and compiler/deployment conditions.

NiceTry now includes
`scripts/check-deployed-fors-verifier.sh RPC_URL VERIFIER_ADDRESS`, which
requires the code at the supplied address to match the pinned compiled runtime
byte-for-byte. This turns deployment identity from prose into a release gate.

## 2026-06-14 — Antonio reviewer package published

The [verification report](/solean-learn/project/verification-report/) now gives
one precise claim for review: complete functional refinement of the optimized-Yul
runtime, on the exact ABI domain, under `evm_keccak_transcript` and
`ffi_kec_size`.

The repository adds a one-command audit that fingerprints the Solidity source,
regenerated optimized IR, and Lean runtime, builds all 1,172 modules, and prints
the final theorem's assumptions. A later parser theorem made the
optimized-Yul-to-runtime import kernel-checked; pinned `solc` and deployment
identity remain production boundaries.

## 2026-06-14 — Phase 5 trust base drops from seven axioms to two

The three `ffi.ByteArray.zeroes` specifications and both
`UInt256.toByteArray` codec facts are now ordinary Lean theorems. The padding
primitive has a reducible Lean body despite its extern implementation, and the
codec proof wraps EVMYulLean's existing private encoder-length theorem.

The generic Keccak numeric bound is no longer assumed either:
`InterpKeccak.lean` trusts only the C boundary's 32-byte output shape
(`ffi_kec_size`) and derives `< 2^256` from EVMYulLean's public decoder theorem.

`lake build NiceTry` passes all 1172 modules. `#print axioms
phase4_forsRefines` now reports Lean core plus exactly
`evm_keccak_transcript` and `ffi_kec_size`. Phase 5 continues as upstream/API
hardening, not as an open correctness proof.

## 2026-06-14 — Phase 5 starts: five Keccak bridge axioms reduced to one

`TranscriptEncoding.lean` now defines the canonical byte encoding of model
transcripts and proves that the deployed address, hmsg, leaf, node, and roots
word sequences match it. The model has one opaque `keccakWord`;
`keccakHash16` and `keccakAddress` are definitions applying the high-128 and
low-160 masks.

The five bundled `evm_keccak_{address,hmsg,leaf,node,roots}` axioms are now
ordinary theorems derived from one generic `evm_keccak_transcript` assumption.
`lake build NiceTry` passes all 1172 modules. The branch declares 7 project
axioms, down from 11; `phase4_forsRefines` uses 6, down from 10.

## 2026-06-14 — Dispatcher routing proved; Phase 4 no longer rests on a routing axiom

**TL;DR.** `Bridge/DispatcherRoute.lean` proves
`dispatcher_routes_to_recover`. The full deployed dispatcher now executes
through selector matching, ABI bounds guards, eager switch composition, and the
call to `fun_recover(100, raw.len, digest)`.

Malformed representable lengths are covered by the real dispatcher revert paths
or by the aligned direct call's out-of-fuel outcome; valid lengths reach the same
recover call with the same fuel. `recoverFuel` is now the exact in-dispatcher
budget, `99983`, so no fuel-monotonicity axiom is needed.

`lake build NiceTry` passes all 1171 modules. The routing axiom is gone:
`phase4_forsRefines` now audits to Lean core plus 10 existing
keccak/FFI/word-codec axioms. The repository declares 11 project axioms globally;
`ffi_zeroes_get!` is not used by the final theorem.

## 2026-06-13 — Phase 4 is complete: deployed FORS refinement proved

**TL;DR.** `Bridge/Phase4.lean` now exports
`phase4_forsRefines : ForsRefines`. The deployed verifier observable matches the
Lean recovery model on the exact ABI-representable input domain.

**What landed.** The accept branch executes the real scoped `fun_recover` call
through the hmsg transcript, all 25 tree reconstructions, roots compression,
low-160 address derivation, and final `RETURN`. Forced-zero rejection is proved
through its concrete `YulHalt` zero return. The malformed-length word guard/body
is proved, and the scoped observable normalizes that outcome to zero. The proof
uses exact fuel `155`, with no fuel-monotonicity axiom.

**Soundness fix.** `ForsRefines` and `RefinesModel` now quantify over
`ForsAbiInput`: representable length, packed 16-byte fields, and a bytes32-sized
digest. The previous length-only domain was false for arbitrary model `Nat`
values because ABI encoding truncates them.

**Verification.** `lake build NiceTry` passes all 1169 modules. `#print axioms
phase4_forsRefines` reports only Lean core plus the documented dispatcher,
keccak, FFI, and word-codec trust items. No `sorryAx`.

**Next.** Phase 5 removes `dispatcher_routes_to_recover`, splits the bundled
keccak/encoding assumptions, upstreams the codec/FFI facts, and discharges the
12 Verity `local_obligations`.

## 2026-06-13 — The complete pre-loop trace now reaches `LoopInv 0`

**TL;DR.** The gap immediately before the proved 25-tree loop is closed.
[`43572e8`](https://github.com/Solvency-Labs/NiceTry/commit/43572e8) adds
`TreeEntryFront.lean`; `lake build NiceTry` now passes all 1166 modules.

**What landed.** `exec_recover_hmsg_named` executes `fun_recover` statements
18–24 through the masked pkSeed read, five hmsg `mstore`s, and
`keccak256(0, 0xa0)`. Named intermediate states avoid the deep definitional
equality blow-up that stopped the previous session. `recoverHmsgDVal_toNat`
proves the resulting interpreter word is the model `hMsg` over the five stored
words. `exec_recover_preloop_to_loopInv` then composes the existing forced-zero
skip, `mstore(0x380, pkSeed)`, and loop-variable initialization to reach
statement 32 with `LoopInv 0`.

**What remains.** Connect the named header words and bytes32 digest to
`decodeTyped raw`/`dValOf`, derive the EVM guard from the model's `forcedZero =
true`, and compose pre-loop + loop + post-loop into `h_accept`. The final counter
read needs the dedicated padded-counter calldata lemma rather than the general
two-chunk payload theorem.

**External context.** The new
[SPHINCS- Verity work](https://github.com/nconsigny/SPHINCS-/tree/main/verity)
proves broader full-scheme models, including C13 and SLH-DSA. Its README states
that the production assembly is hand-transcribed and code-to-model
correspondence rests on review. Our narrower project remains differentiated by
its stronger target: refinement of the deployed FORS+C runtime through
EVMYulLean.

## 2026-06-13 — The tree loop is closed; M4 assembly is now the frontier

**TL;DR.** The former long pole is done: the real 25-iteration `fun_recover` tree loop is proved end to end on `agent/tree-loop-A2`. The current `lake build NiceTry` passes all 1164 modules. The remaining happy-path work is assembly around the loop, not the loop induction itself.

**What landed.** `TreeLeaf` through `TreeLoop` symbolically execute the six hashes in each iteration, maintain the machine-state invariant, advance all pointers and index bits, and prove all 25 root slots contain the model chain values. `TreeCalldata` now provides the general payload-pair extraction, masked `calldataload` → `read16` bridge, `RawSigWellFormed`, and closed-form `loopSk`/`loopSib` reads. `TreeFinal` supplies the roots-buffer/post-loop compression and address-return machinery.

**Update:** this stopping point was closed later on June 13 by
`TreeEntryFront.lean`; see the entry above.

**Trust and remaining work.** The development branch has 12 explicit labeled axioms: 5 keccak-shape bridges, 3 FFI zero-padding specs, 2 word-codec specs, `ffi_kec_lt`, and the temporary `dispatcher_routes_to_recover`. No `sorryAx` was introduced. `h_len`, `h_guard`, final `h_accept` assembly, dispatcher-axiom removal, and the 12 Verity `local_obligations` remain open.

## 2026-06-09 — Class-A landed: the calldata byte library + dispatcher trace (and a soundness fix)

**TL;DR.** The ABI-parsing foundation is proved and merged into `evmrun-runtime`: a `calldataload` byte-reasoning library, plus a symbolic execution of the `recover(bytes,bytes32)` dispatcher all the way into early `fun_recover`. Independently verified — builds green (1145 modules), `sorry`-free, axiom-clean. The reject-path obligations (`h_len`/`h_guard`) are not closed yet, but the foundation under them now is.

**What's proved (`Bridge/CalldataBytes.lean`, `ClassA*.lean`).**
- The calldata byte library: `ByteArray.readBytes` over `copySlice` + the opaque `ffi.zeroes`, then extraction over `encodeForsCalldata`'s ABI layout — `calldatasize = 2548`, selector `= 0x1aad75c5`, `calldataload 4 = 0x40`, `calldataload 36 = digest`, `calldataload 0x44 = raw.len`, and the payload chunk reads (incl. the zero-padded final counter).
- The dispatcher trace: free-mem-ptr init → selector/size/callvalue/offset/digest/length reads → guards skipped for the good call → `offset = 0x40`, `length = raw.len`, specialized to `SigLen` → `constant_FORS_SIG_LEN() = SigLen` → the recover call's args reduce to `[100, SigLen, digest]` → enter `fun_recover`, through the masked pkSeed/R/counter reads.

**A soundness fix you should know about (`Bridge/RawDomain.lean`).** Refinement is now stated over **ABI-representable lengths** (`raw.len < 2²⁵⁶`). This is a *correction*, not a hedge: `RawSig.len` is an unbounded `Nat`, but an ABI `bytes.length` is one 256-bit word, so a model length `≥ 2²⁵⁶` truncates `mod 2²⁵⁶` and could collide with `SigLen` — making the *unbounded* claim false. Scoped minimally (only the bad-length branch needs it); real calldata always satisfies it. Same calibre of catch as the earlier `evmRun` vacuity bug — found by an agent running the workstream, then independently re-verified.

**Trust surface.** One new labeled axiom, `uint256_toByteArray_roundtrip` (`uInt256OfByteArray v.toByteArray = v`) — a true big-endian codec fact, provable from EVMYulLean's `private` `fromBytes'_toBytes'`, so tracked as pending the same upstream PR as `uint256_toByteArray_size`. Base is now **10 axioms** (5 keccak shapes + 3 FFI memory-padding + 2 word-codec); no cryptographic/hardness assumptions added. The reduction spine `forsRefines_of_branches` still depends on **zero** of them.

**What changes for you.** The dispatcher/calldata groundwork is done, so the two reject obligations (`h_len`/`h_guard`) are now a mechanical finish on top of it. The hard core is still the **FORS tree-climb loop** (`h_accept`). See [roadmap](/solean-learn/project/roadmap/) (Phase 4) and the repo's `Bridge/PICKUP.md`.

## 2026-06-04 — `evmRun` actually runs now (it didn't), + the full interpreter-stepping toolkit

**TL;DR.** Three things landed on `Solvency-Labs/NiceTry` (branch `evmrun-runtime`): (1) a **caught-and-fixed bug** that made the refinement target `evmRun` vacuous, (2) the **refinement spine** that reduces the whole goal to three named facts, and (3) a **complete interpreter-stepping foundation** — every opcode/construct the contract uses now has a reduction lemma. All `sorry`-free, trust surface unchanged.

**The bug (important).** `runForsCalldata` was executing the dispatcher on a state with an **empty account map**. The `recover` path calls `fun_recover` through EVMYulLean's `call`, which does `accountMap.find? codeOwner` and errors `MissingContract` *before* the code-override is consulted. That error isn't a `YulHalt`, so `evmRun` returned `0` for **every** input — which would have made `h_accept`/`ForsRefines` *false* and the reject-path goals *vacuously* true. Proven (`find? codeOwner = none` by `rfl`; `call … = MissingContract`) and **fixed** by installing an account at `codeOwner` (its code is superseded by the override; it only needs to exist). Post-fix `find? codeOwner |>.isSome = true` by `rfl`. Lesson: a "real interpreter invocation" can typecheck and still execute nothing — verify the contract is actually reached.

**The refinement spine (`Bridge/Refinement.lean`).** `forsRefines_of_branches` proves `ForsRefines` from exactly three interpreter-run facts — `h_len` (bad length → `address(0)`), `h_guard` (forced-zero reject → `address(0)`), `h_accept` (else `= addressFromRoot pkSeed (recoverRoot …)`). It does *all* the model-side glue (the `recoverRaw?` case split + the `none ↔ address(0)` correspondence) and adds **zero trust** (`#print axioms` = `propext/Classical.choice/Quot.sound`). So the entire proof now factors into three precise, independently-claimable targets.

**The interpreter-stepping foundation (complete).** Symbolically executing the *real* `ForsVerifier` runtime needs a reduction lemma for every construct it uses; they now exist and are `sorry`-free:
- `Bridge/Interp.lean` — control flow (`Block`/`If`/`Leave`/`Break`/`Continue`/fuel) + `eval` base cases. Recipe: `conv_lhs => rw [exec]` then `rw` the sub-result.
- `Bridge/InterpOps.lean` — the 14 pure stack builtins (`add sub lt gt slt and or xor shl shr byte eq iszero not`).
- `Bridge/InterpState.lean` — the 7 stateful ops (`calldataload`, `mstore`, `keccak256`, `return`⇒`YulHalt`, `revert`⇒`.Revert`, `callvalue`, `calldatasize`).
- `Bridge/InterpCall.lean` — user-function `call`/`execCall` (entering `fun_recover`) and the `switch` selector (EVMYulLean's `switch` eagerly runs *all* case bodies, then `foldr`-selects).
- `Bridge/InterpEval.lean` — builtin-call composition (`eval_binop2`/`eval_unop1`), so nested expressions like `and(calldataload(x), not(C))` evaluate compositionally.

A genuinely useful EVMYulLean idiom fell out: `step` (the opcode semantics) reduces with `unfold step; rfl` — blind `simp [step]` times out on its `dbg_trace`/`Id.run`.

**What changes for you.** The machinery to step the deployed contract is done — what remains for the reject paths (`h_len`/`h_guard`) is **one** more brick: a `calldataload` **byte-reasoning library** (the same scale as the existing memory library) — `readBytes` over `copySlice` + the opaque `ffi.ByteArray.zeroes`, a 32-byte word round-trip (likely a small trust axiom, since EVMYulLean's `fromBytes'_toBytes'` is `private`), and extraction over `encodeForsCalldata`'s ABI layout. Then `h_len` assembles mechanically. `h_accept` is the tree-loop (Phase 4's hard core) feeding the already-proved `AddressShape` handoffs. Full breakdown in the repo's `Bridge/PICKUP.md`.

## 2026-06-01 — Address shape now matches the *real* contract

**TL;DR.** The first proved shape (address derivation) was an empty-memory *template*. It's now generalized to **write-over-existing memory**, so it matches how the contract actually runs. Still `sorry`-free; trust surface unchanged.

**Why it matters.** In the real execution, by the time the contract hashes the signer address, memory is already full — `pkSeed` has sat at `0x00` since the Hmsg step, and only a single `mstore(0x20, pkRoot)` runs before `keccak256(0x00, 0x40)`. The template assumed empty memory + two fresh writes, which isn't the real choreography. The new lemmas (`byteArray_write_overwrite`, `readWithPadding_prefix`, `address_keccak_input_overwrite`, `address_derivation_eq_overwrite`) close that gap.

**What changes for you.** The byte layer now supports overwriting within populated memory — the prerequisite for *every* remaining shape (they all reuse memory). Next mechanical step: an **overwrite n-word variant** of `writeWords32_data`, then hmsg/leaf/node. See the [roadmap](/solean-learn/project/roadmap/) (Phase 3 updated, Phase 4 open).

## 2026-06-01 — Direction locked, foundation proved, work moves to the fork

**TL;DR.** We audited the existing FORS model, picked our route, and proved the first end-to-end slice of the real goal. The verification work now lives in a **fork of NiceTry under our org**, not the SoLean repo. New [roadmap](/solean-learn/project/roadmap/) and [workstreams map](/solean-learn/project/workstreams/) are up.

**What we learned (Phase 1).** The verity FORS model is in far better shape than we feared: its structural Lean proofs are **fully closed (zero `sorry`)** and it already compiles to Yul with a Foundry replay against the real contract. The gap is precise — **12 `local_obligations`** at the Verity→Yul boundary, and no proof yet linking the *hand-written* `ForsVerifier.sol` to the model.

**Decisions.** We're going **route B**: certify the deployed hand-written contract via an **EVMYulLean equivalence** (vs shipping a verified-by-construction replacement). Target is **spec-correctness conditional on trusted keccak** — not cryptographic soundness. All six prior open questions are now resolved (see the [log](/solean-learn/reference/project-log/)).

**What's proved (Phases 2–3).** The SoLean oracle discharge + refinement-sufficiency theorem, a from-scratch `ByteArray`/memory lemma library, and the **address transcript closed end-to-end** (EVM execution → keccak → the model's `addressFromRoot`). All `sorry`-free, with the trust surface localized to a handful of labeled axioms.

**What changes for you.**
- **New home:** code work happens in `Solvency-Labs/NiceTry` under `verity/NiceTry/Fors/Bridge/`. The SoLean repo is now the *methodology + oracle interface* layer, not the dev locus. Setup in [Workstreams](/solean-learn/project/workstreams/).
- **New goals:** Phase 4 is open for claiming — the **hmsg/leaf/node** shapes (mechanical now, template exists) and the harder **roots loop / full-contract execution** model.
- **Still pending:** Antonio to confirm route B + the "what counts as verified" bar.

**Grab a workstream** on the [Project log](/solean-learn/reference/project-log/).

## 2026-05-28 — Project kickoff
Kickoff with Antonio Sanso: verify `ForsVerifier.sol`. Decisions: keccak trusted, tooling pivot to verity + EVMYulLean. This learning site stood up. (See the [Project log](/solean-learn/reference/project-log/).)
