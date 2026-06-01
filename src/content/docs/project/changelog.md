---
title: Changelog
description: Dated, team-facing updates — what shipped, what changed, what's next. Newest first.
---

Bigger-picture than the append-only [Project log](/solean-learn/reference/project-log/) (which is decisions + open questions). This is the "what happened and what it means for you" feed.

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
