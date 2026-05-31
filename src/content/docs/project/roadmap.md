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

## Phase 3 — EVMYulLean equivalence: byte foundation + first shape 🔄
- **ByteArray lemma library** (proved): `byteArray_write_append` (one `mstore` = concat), `readWithPadding_exact` (what `keccak256` reads), `two_word_writes`, and **`writeWords32_data`** (the n-word generalization, reusable for every shape).
- **MachineState bridge** (proved): `mstore_memory`, `address_keccak_input` (EVM execution → exact keccak input bytes).
- **Address transcript closed end-to-end** (`address_derivation_eq`): EVM keccak-and-mask = the model's `addressFromRoot`. **First shape proved EVM→model.**
- **Now real-contract-accurate** (`address_derivation_eq_overwrite`): generalized off the empty-memory *template* to **write-over-existing memory** — `byteArray_write_overwrite`, `readWithPadding_prefix`, `address_keccak_input_overwrite`. Matches the actual run: `pkSeed` already sits at `0x00`, a single `mstore(0x20,pkRoot)` overwrites within a populated memory, and `keccak256(0x00,0x40)` still reads `pkSeed ‖ pkRoot`.
- `Bridge/MemoryLayout.lean` — Class-C layout/non-overlap facts (the contract's `_GUARD`s) (proved).
- Trust localized to named axioms; everything else checks to Lean's core. See [Workstreams → trust surface](/solean-learn/project/workstreams/#trust-surface).

## Phase 4 — Remaining shapes + full contract ⏳
- Apply the (now real-contract) address-shape proof to **hmsg / leaf / node** — needs an **overwrite n-word variant** of `writeWords32_data` + per-shape keccak bridges.
- The hard one: **roots** — 27 words *plus* the FORS tree-climb **loop** and ADRS arithmetic.
- Model the **full contract execution** (tree loop, grinding check, raw ABI parse), **threading the memory state across the whole run**, and compose all shapes into `RefinesModel evmRun`.
- **Discharge the 12 `local_obligations`** (flip `.assumed → .proved`).

## Phase 5 — Trust-surface reduction & upstream ⏳
- Split `evm_keccak_address` into a keccak-only axiom + a *proved* `encodeTranscript` masking lemma (Gap B).
- **Upstream PR** to `lfglabs-dev/EVMYulLean` de-privatizing `toBytes'_le`, to discharge `uint256_toByteArray_size`.

## Phase 6 — SoLean integration & report ⏳
- Wire the proved FORS theorem into SoLean's `PQVerifierWrapper` (refine its placeholder `signature : UInt256` to a real `RawSig`).
- Final write-up + hand back to Antonio.

---

**Now:** Phase 3 is landed and the address shape is **real-contract-accurate**, not just a template. Phase 4 is open: the next mechanical step is the **overwrite n-word lemma** → hmsg/leaf/node; the intellectually hard step is the **roots loop / full-execution model** (best as a dedicated focused effort). Claim a workstream on the [Project log](/solean-learn/reference/project-log/).
