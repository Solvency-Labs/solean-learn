---
title: Project log
description: Living record of decisions made and open questions — so the team stays in sync and newcomers can see the current state.
---

A lightweight, append-only record of **decisions** and **open questions**. Newest first. This is where the [task page's](/solean-learn/task/) open threads get tracked and resolved. For the phased plan see the [Roadmap](/solean-learn/project/roadmap/); for narrative updates see the [Changelog](/solean-learn/project/changelog/).

## Open questions

These are live. Claim one, resolve it, then move it to "Decisions" with the outcome.

1. **Antonio sign-off** — confirm route B + the proposed "verified" bar (full refinement, no `assumed`, with an explicit keccak + EVM-memory-primitive trusted base). *(pending; drafted)*
2. **[workstream] hmsg / leaf / node shapes** — apply the `address_derivation_eq` template via `writeWords32_data` + per-shape keccak bridges. *(mechanical; claimable)*
3. **[workstream] roots shape + full execution** — the FORS tree **loop** + ADRS arithmetic + composing all shapes into `RefinesModel evmRun`. *(the hard core; best as a focused effort)*
4. **[workstream] write-over-existing memory** — generalize the empty-memory assumption (the contract reuses the `0x00` region across hashes).
5. **[workstream] Gap-B split** — separate `evm_keccak_address` into a keccak-only axiom + a proved `encodeTranscript` masking lemma.
6. **[workstream] upstream PR** — de-privatize `toBytes'_le` in EVMYulLean to discharge `uint256_toByteArray_size`.

## Decisions

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
