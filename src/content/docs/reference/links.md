---
title: Annotated links
description: The curated reading list — primary sources for each track, with notes on what to read and what to skip.
---

Not a link dump. For each item: *what it is* and *what to take from it*. Grouped by track.

## The task itself (read these first)

- **[`ForsVerifier.sol`](https://github.com/Solvency-Labs/NiceTry/blob/main/src/Verifiers/ForsVerifier.sol)** — the real verifier contract. Even if it's opaque now, skim it once so the [line-by-line page](/solean-learn/fors/the-contract/) has something to map onto.
- **[`NiceTry` (Solvency main)](https://github.com/Solvency-Labs/NiceTry/tree/main)** — the current home of the FORS model, bridge proof, review path, and audit script.
- **[`ReviewSurface.lean`](https://github.com/Solvency-Labs/NiceTry/blob/main/verity/NiceTry/Fors/Bridge/ReviewSurface.lean)** — the small theorem surface reviewers should read first.

## T1 · Ethereum & the EVM

- **ethereum.org developer docs** — "Intro to Ethereum" and "Accounts." The friendly canonical intro. Skip dapp tutorials.
- **[evm.codes](https://www.evm.codes/)** — interactive opcode reference + playground. Bookmark for when Yul opcodes confuse you.
- **Solidity docs → "Yul"** — the authoritative Yul spec. Read the intro + specification; skip optimizer internals.

## T2 · Account abstraction & PQ

- **Antonio Sanso, *"The road to Post-Quantum Ethereum transactions is paved with Account Abstraction"*** — the project's framing. Read in full; it's the "why."
- **EIP-4337** (`eips.ethereum.org/EIPS/eip-4337`) — authoritative AA spec. Read the overview + `UserOperation` struct; skip mempool/DoS details first pass.
- **EIP-7702** (`eips.ethereum.org/EIPS/eip-7702`) — skim the abstract + security considerations (the "original key still valid" caveat).

## T3 · Hash-based signatures & FORS

- **SPHINCS+ submission / NIST FIPS 205 (SLH-DSA)** — authoritative definitions of FORS and the hypertree. Use as *reference* after the intuition, not a cover-to-cover read.
- **A visual Merkle-tree / hash-based-signatures explainer** — if [T3](/solean-learn/fors/) felt fast, a visual walkthrough cements the tree-climbing idea before the contract.

## T4 · Lean 4 & formal verification

- **"Theorem Proving in Lean 4"** (`leanprover.github.io/theorem_proving_in_lean4/`) — *the* main study item. Work through Dependent Type Theory, Propositions & Proofs, and Tactics chapters.
- **"Mathematics in Lean"** — more example-driven; good second pass.
- **Lean community Zulip** — where to ask when stuck.

## T5 · The tooling

- **[`NethermindEth/EVMYulLean`](https://github.com/NethermindEth/EVMYulLean)** — formal EVM/Yul semantics in Lean. Read the README + browse `SpongeHash.lean` and the Yul `exec`/`eval`.
- **[`Th0rgal/verity` → `Compiler`](https://github.com/Th0rgal/verity/tree/main/Compiler)** — the verified Lean→Yul compiler. Browse the subdir names (`Yul`, `Keccak`, `Proofs`) to get the shape.
- **SoLean repo** — our own project; `docs/pq-aa-roadmap.md`, `docs/assumptions.md`, and `SoLean/Examples/`.

:::tip[Keep this list honest]
If you find a better resource, or one of these turns out unhelpful, edit this page. A curated list only stays valuable if it's curated.
:::
