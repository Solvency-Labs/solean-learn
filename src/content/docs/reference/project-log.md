---
title: Project log
description: Living record of decisions made and open questions — so the team stays in sync and newcomers can see the current state.
---

A lightweight, append-only record of **decisions** and **open questions**. Newest first. This is where the [task page's](/solean-learn/task/) open threads get tracked and resolved. For the phased plan see the [Roadmap](/solean-learn/project/roadmap/); for narrative updates see the [Changelog](/solean-learn/project/changelog/).

## Open questions

These are live. Claim one, resolve it, then move it to "Decisions" with the outcome.

1. **Antonio sign-off** — confirm route B + the proposed "verified" bar
   (full refinement of the reviewed optimized-IR transcription, with the
   explicit two-item Keccak boundary; auxiliary kernel-loop obligations
   documented separately). The reviewer package is now
   published in the [verification report](/solean-learn/project/verification-report/).
   *(pending Antonio's decision)*
2. **[workstream] upstream hardening** — expose a public EVMYulLean word-codec
   theorem to replace the local private-name hook; assess whether the 32-byte
   `ffi.KEC` extern contract should remain explicit or link to modeled Keccak.
3. **[decision] Verity kernel boundary** — decide whether the two held
   auxiliary-kernel choreography obligations should remain documented or receive
   a separate duplicate loop proof.

## Decisions

### 2026-06-14 — production safety claim split into proof and release gates
The verifier computation is green, but the production claim is deliberately
conditional. A release must match the deployed bytecode exactly, use
recover-and-compare against the current nonzero owner, construct the same
digest, and enforce the FORS few-time-key lifecycle. The public verification
report now explains these conditions without formal-methods shorthand, and the
NiceTry repository includes a byte-for-byte deployment checker. This prevents
the component theorem from being misrepresented as an unconditional proof of
the whole wallet system.

### 2026-06-14 — Antonio verification package is reproducible
The canonical report now states the exact `phase4_forsRefines` claim, ABI
domain, two project assumptions, non-claims, and optimized-IR transcription
boundary. `scripts/audit-fors-verifier.sh` pins the Solidity source, regenerated
optimized IR, and Lean runtime fingerprints, then builds all 1,172 modules and
prints the final axiom closure. The remaining reviewer decision is whether the
reviewed transcription boundary is acceptable or must be replaced by a
compiler-output-to-EVMYulLean certificate.

### 2026-06-14 — padding and codec axioms are discharged; trust base is two
`EvmFfiSpec.lean` now proves the three `ffi.ByteArray.zeroes` facts and both
`UInt256.toByteArray` codec facts. `InterpKeccak.lean` replaces the trusted
numeric bound with one narrow extern-shape assumption, `ffi_kec_size`, and
derives `< 2^256` using EVMYulLean's decoder theorem. `phase4_forsRefines`
depends only on Lean core, `evm_keccak_transcript`, and `ffi_kec_size`.
`lake build NiceTry` passes all 1172 modules.

### 2026-06-14 — Gap B is split; five Keccak axioms become one
`TranscriptEncoding.lean` proves the concrete EVM bytes for all five transcript
shapes, while `Hash.lean` defines hash16/address outputs as masks of one opaque
Keccak word. The only cryptographic bridge is now
`evm_keccak_transcript`. The declared project trust base drops from 11 axioms to
7, and `phase4_forsRefines` uses 6. `lake build NiceTry` passes all 1172 modules.

### 2026-06-14 — deployed dispatcher routing is proved
`Bridge/DispatcherRoute.lean` proves `dispatcher_routes_to_recover` by executing
the selector switch, ABI bounds guards, and exact-fuel call into `fun_recover`.
Malformed representable lengths are handled by the concrete revert/out-of-fuel
outcomes. The temporary routing axiom is gone; `lake build NiceTry` passes all
1171 modules, and `phase4_forsRefines` audits to Lean core plus 10 existing
keccak/FFI/codec axioms.

### 2026-06-13 — Phase 4 deployed refinement is complete
`Bridge/Phase4.lean` exports `phase4_forsRefines : ForsRefines`. The accept
trace runs the real scoped call through hmsg, all 25 trees, roots compression,
address derivation, and return; the two reject outcomes return zero. The theorem
uses the truthful `ForsAbiInput` domain because the model's unbounded `Nat`
fields otherwise truncate at the ABI boundary. `lake build NiceTry` passes all
1169 modules; the axiom audit shows only the documented trust surface.

### 2026-06-13 — the complete pre-loop execution trace is proved
`TreeEntryFront.lean` executes `fun_recover.body[18:32]`, proves the five-word
hmsg transcript/value, and composes through the forced-zero skip and loop
initialization to `LoopInv 0`. The previous deep-definitional-equality blocker
was removed by naming each intermediate machine state. `lake build NiceTry`
passes all 1166 modules; the next edge is header/model glue and final
`h_accept` composition.

### 2026-06-13 — SPHINCS- is broader, but proves a different boundary
Antonio shared the new
[SPHINCS- Verity repository](https://github.com/nconsigny/SPHINCS-/tree/main/verity)
and [Ethereum Research post](https://ethresear.ch/t/sphincs-minus-efficient-stateless-post-quantum-signature-verification-on-the-evm/25165).
It covers full C13 and SLH-DSA-style verifiers, including FORS/FORS+C,
WOTS+/WOTS+C, and hypertree verification. Its own README says the production
assembly is hand-transcribed into non-deployed Verity models and correspondence
to the code rests on review. Our scope is narrower (the FORS+C verifier), but
route B proves the complete reviewed optimized-IR runtime execution, including
dispatcher and reject paths, through EVMYulLean. The source-to-transcription
link remains review-based. Treat the projects as complementary and mine their
full-scheme proof structure for reusable patterns.

### 2026-06-13 — the real 25-tree interpreter loop is proved
The `agent/tree-loop-A2` branch closes the complete 25-iteration `fun_recover` loop: six hashes per tree, loop-state induction, pointer/index arithmetic, calldata-to-model opening values, and all 25 root-buffer writes. Post-loop roots/address machinery is also proved. The live frontier is the pre-loop statement trace and final `h_accept` composition, not the tree induction. `lake build NiceTry` passes all 1164 modules.

### 2026-06-01 — route B (certify the hand-written contract)
We certify the deployed inline-assembly `ForsVerifier.sol` by proving it **refines** a clean Lean model via **EVMYulLean** (not by shipping a verified-by-construction verity Yul replacement). Rationale: it blesses the actual production artifact and is the more useful result; the model already exists, so the marginal work lands on the equivalence itself. *(Resolves old Q2.)*

### 2026-06-01 — "verify" = spec-correctness conditional on trusted keccak
Target is **functional/spec-correctness** of FORS+C recovery, conditional on keccak being a collision-resistant RO + a small set of EVM memory-primitive specs. **No cryptographic soundness/unforgeability claim** — inherited from the FORS scheme. Settled by the model's own framing (keccak opaque); proposed to Antonio for sign-off. *(Resolves old Q1.)*

### 2026-06-01 — work lives in the NiceTry fork, on `fors-verity-model`
The verification work (model + our `Bridge/`) lives in **`Solvency-Labs/NiceTry`** (a fork of `RivaLabs-Core/NiceTry`), branch `fors-verity-model`, under `verity/NiceTry/Fors/`. SoLean stays the methodology + oracle-interface layer. See [Workstreams](/solean-learn/project/workstreams/). *(Resolves old Q3.)*

### 2026-06-01 — model audit: structural proofs closed, 12 obligations open
The existing verity FORS model has **zero `sorry`** in its structural proofs (decode, forced-zero guard, 25-tree climb, roots compression, address derivation), compiles to Yul, and has a Foundry replay vs the real contract. The open work is **12 `local_obligations`** at the Verity→Yul boundary + no hand-written-contract equivalence. *(Resolves old Q4; old Q5 contract numbers checked against source during the read.)*

### 2026-06-01 — composition interface: recover-and-compare-address
SoLean's `Env.verifier` oracle is discharged by the FORS model's recovery: accept iff `recover(sig, digest) = expectedSigner`. Proved in `Bridge/Oracle.lean` (`forsAccept_of_legit`). SoLean still owes a representation refinement (its `signature : UInt256` → a real `RawSig`). *(Resolves old Q6.)*

### 2026-05-28 — keccak is trusted, not proven
We do **not** re-prove keccak; it's taken as a correct primitive (modeled in EVMYulLean's `SpongeHash`, used by verity). Rationale: it reduces FORS verification to *structural* reasoning (parsing, tree-climbing, index math), making the task tractable. Source: kickoff with Antonio Sanso.

### 2026-05-28 — this is a tooling pivot, not a teardown
The FORS work happens in the native tools (verity + EVMYulLean), **not** by extending SoLean's DSL to handle bytes/Merkle. SoLean is kept as the *outer wallet layer* and the *methodology*; its abstract verifier oracle is the slot a finished FORS proof discharges. See [SoLean](/solean-learn/tooling/solean/) and [the task](/solean-learn/task/).

### 2026-05-28 — build this learning guide
Stood up this site (Astro Starlight) so the whole team can go noob→expert on the four worlds (Ethereum, AA, PQ/FORS, Lean) the task spans.

## How to add an entry

Append under the right heading with a date (`YYYY-MM-DD`). For a decision, include the **rationale** and a **source** (meeting, doc, or proof). For resolving an open question, move it down to Decisions with the outcome. Keep it to a few lines — this is an index of what changed, not a wiki.
