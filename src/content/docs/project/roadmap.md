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

## Phase 4 — Remaining shapes + full contract 🔄
**Done (the input layer — all shapes):**
- **Input-byte shapes proved** (EVM execution → exact keccak-input bytes) for **all five transcripts** — hmsg, leaf, node, address, roots — via the overwrite `mstoreWords32At` lift + per-shape keccak bridges.
- **Roots buffer setup proved**: full 25-root buffer, indexed `TreeIndex→UInt256` form, memory-size preservation, and the prefix invariant for the first `n ≤ 25` writes.
- **Roots compression handoffs** up to `compressRoots`/`recoverRoot`; leaf + five-node hash-chain skeleton; typed leaf/node wrappers; raw-signature layout + forced-zero facts.

**Remaining (the execution core — the hard part).** Feasibility spike done: lifting `ForsVerifier.sol` into EVMYulLean is **GO** — the contract is `pure` (calldata + memory + keccak only), every builtin it uses plus `switch`/`for` is supported, and it compiles to a **265-line optimized Yul IR** that transcribes into EVMYulLean's elaboration DSL. The concrete path:
- **Build `forsVerifierRuntime`** — transcribe the deployed Yul IR into EVMYulLean's `<s{…}>`/`<f…>` notation (strip the constructor object, rewrite `memoryguard(x) → x`). *~2–3 days.*
- **Define `evmRun`** — ABI-encode `recover(bytes,bytes32)` calldata, run `execTopLevel` with fuel, decode the returned address. *~0.5–1 day.*
- **Prove `RefinesModel evmRun`** *(the long pole — multi-week)*: induct over the fuel-based `forEach t 25` loop, maintaining the prefix invariant + the six per-iteration hash-chain facts (leaf + 5 nodes) + the real root-slot write at `0x40 + 32·t`; thread EVM state through hmsg → forced-zero → loop → compression → address; ABI parse. Each `keccak256` plugs into the proved shape lemmas.
- **Discharge the 12 `local_obligations`** (flip `.assumed → .proved`) + deny-obligations build.

> **Fidelity note (for the Antonio review).** This certifies *"the Yul IR refines the model."* It will add two trusted items — **solc's IR→bytecode codegen** and the **IR→DSL transcription** — alongside the keccak/memory axioms. Removing the codegen trust means verifying the deployed *bytecode* via EVMYulLean's EVM semantics, a much larger proof.

## Phase 5 — Trust-surface reduction & upstream ⏳
- Split `evm_keccak_address` into a keccak-only axiom + a *proved* `encodeTranscript` masking lemma (Gap B).
- **Upstream PR** to `lfglabs-dev/EVMYulLean` de-privatizing `toBytes'_le`, to discharge `uint256_toByteArray_size`.

## Phase 6 — SoLean integration & report ⏳
- Wire the proved FORS theorem into SoLean's `PQVerifierWrapper` (refine its placeholder `signature : UInt256` to a real `RawSig`).
- Final write-up + hand back to Antonio.

---

**Now:** Phase 4's **input layer is done — all five shapes' keccak-input bytes are proved**, plus the roots buffer and compression handoffs. The **execution core** is the remaining milestone, and the feasibility spike says **GO**: lift the contract's Yul IR into EVMYulLean (`forsVerifierRuntime`), define `evmRun`, then prove `RefinesModel evmRun` (the multi-week loop-refinement). The next concrete chunk is the **transcription + `evmRun` setup (~3–4 days)** — it turns the proved shape lemmas into plug-ins. **Coordinate ownership** (this overlaps the Codex workstream — one owner for the loop). Claim it on the [Project log](/solean-learn/reference/project-log/).
