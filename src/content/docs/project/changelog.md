---
title: Changelog
description: Dated, team-facing updates — what shipped, what changed, what's next. Newest first.
---

Bigger-picture than the append-only [Project log](/solean-learn/reference/project-log/) (which is decisions + open questions). This is the "what happened and what it means for you" feed.

## 2026-06-02 — The deployed contract now runs inside EVMYulLean; `ForsRefines` stated

**TL;DR.** The execution-core *scaffolding* is built. `ForsVerifier.sol` is transcribed verbatim into EVMYulLean and actually executes there; the single refinement goal `ForsRefines` is stated. All `sorry`-free. What remains is proving it — the FORS tree-loop induction (the multi-week long pole).

**What's built.** `forsVerifierRuntime` — the deployed object (dispatcher + `fun_recover` incl. the tree `for`-loop + `constant_FORS_SIG_LEN`) transcribed byte-faithfully from the optimized Yul IR. `evmRun : RawSig → Digest → Address` — encodes `recover(bytes,bytes32)` calldata, runs it through the interpreter, decodes the returned address. `ForsRefines : Prop = evmRun raw digest = (recoverRaw? raw digest).getD 0` — the one goal the whole Bridge feeds, decomposed in-file into 6 steps consuming the proved shape lemmas.

**Honest finding.** The contract returns **`address(0)`** on a bad/not-grinded signature where the model returns **`none`** — so the refinement uses `.getD 0`, not exact equality (the Oracle sufficiency theorem survives, since it checks `== expectedSigner`, nonzero).

**What changes for you.** The remaining work is now a single, well-scoped target: **prove `ForsRefines`**, i.e. induct over the interpreter running the tree loop 25× (six hash-facts per iteration + the root write), threading EVM state end-to-end. That's the next milestone. (Code on branch `evmrun-runtime` in the fork; WIP, not yet PR'd.)

## 2026-06-01 — Spike: lifting `ForsVerifier.sol` into EVMYulLean is **GO**

**TL;DR.** We checked whether the *execution core* is even feasible — i.e. can the real contract be represented and run inside EVMYulLean so we can prove `RefinesModel evmRun`. Answer: **yes, no dead-ends.**

**What we found.** EVMYulLean ingests Yul via a compile-time elaboration DSL (`<s{…}>`/`<f…>`), and its own tests embed solc-IR-style Yul — so `forsVerifierRuntime` is built by transcribing solc's Yul IR into that DSL. The contract is `pure` (calldata + memory + keccak only — no storage/`CALL`), every builtin it uses plus `switch`/`for` is supported, and it compiles to a **265-line optimized Yul IR**. The only friction is deployment-layer constructs (`memoryguard`, nested `object`) that don't touch the runtime logic — `memoryguard(x)` transcribes as `x`.

**Estimate.** Transcribe `forsVerifierRuntime` (~2–3d) + define `evmRun` (~0.5–1d) makes the proved shape lemmas plug in; **proving `RefinesModel evmRun` is the multi-week long pole** (induction over the fuel-based tree loop). Obligations are a modest separate track.

**Fidelity (for the Antonio review).** This certifies *"the Yul IR refines the model"* — it adds trust in **solc's IR→bytecode codegen** and the **IR→DSL transcription**. Removing the codegen trust = verifying the deployed bytecode via EVMYulLean's EVM semantics (much bigger).

**What changes for you.** The execution core has a concrete plan and new claimable tasks (see the [roadmap](/solean-learn/project/roadmap/) Phase 4 and the [Project log](/solean-learn/reference/project-log/)). **Coordinate ownership** — this overlaps the Codex workstream; one owner for the loop refinement.

## 2026-06-01 — All five transcript shapes' input bytes proved + roots buffer

**TL;DR.** The Codex agent took the roots / memory-transcript workstream and closed the **input layer for every shape**. Independently verified: full `lake build`, **zero `sorry`/`admit`** across the Fors tree, axiom audit within the labeled set.

**What's proved.** EVM-execution-→-keccak-input-bytes for **hmsg, leaf, node, address, roots**; the full 25-root buffer setup (indexed form, size preservation, prefix invariant for the first `n ≤ 25` writes); compression handoffs up to `compressRoots`/`recoverRoot`; the leaf + five-node hash-chain skeleton; and the raw-signature layout + forced-zero facts.

**Trust surface (heads-up for the Antonio review).** Now **5 per-shape keccak bridges** (`evm_keccak_address/hmsg/leaf/node/roots`) instead of one — each encoding-guarded, each isolating the opaque keccak step + the masking correspondence (Gap B, splittable later). Plus the 3 `ffi.ByteArray.zeroes` specs and `uint256_toByteArray_size`. No cryptographic-hardness assumptions.

**What's left.** The execution core: the real `forEach t 25` loop maintaining the prefix invariant + emitting the six per-iteration hash-chain facts + the actual root-slot write; full EVM state threading; ABI parsing; `RefinesModel evmRun`; flipping the `local_obligations`. See [PR #1 on the fork](https://github.com/Solvency-Labs/NiceTry/pull/1) and the [roadmap](/solean-learn/project/roadmap/).

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
- **New home:** code work happens in `Solvency-Labs/NiceTry` (fork), branch `fors-verity-model`, under `verity/NiceTry/Fors/Bridge/`. The SoLean repo is now the *methodology + oracle interface* layer, not the dev locus. Setup in [Workstreams](/solean-learn/project/workstreams/).
- **New goals:** Phase 4 is open for claiming — the **hmsg/leaf/node** shapes (mechanical now, template exists) and the harder **roots loop / full-contract execution** model.
- **Still pending:** Antonio to confirm route B + the "what counts as verified" bar.

**Grab a workstream** on the [Project log](/solean-learn/reference/project-log/).

## 2026-05-28 — Project kickoff
Kickoff with Antonio Sanso: verify `ForsVerifier.sol`. Decisions: keccak trusted, tooling pivot to verity + EVMYulLean. This learning site stood up. (See the [Project log](/solean-learn/reference/project-log/).)
