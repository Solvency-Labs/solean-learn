---
title: Glossary
description: The dense jargon from all four worlds — Ethereum, account abstraction, post-quantum crypto, and formal verification — in one place.
---

Four fields collide in this project. Look words up the moment they appear. Grouped loosely; skim or `Ctrl-F`.

## Ethereum & EVM

- **EOA (externally-owned account)** — an account controlled by a private key (today, ECDSA). The thing quantum computers threaten.
- **Contract account** — an account controlled by code, with persistent storage. `ForsVerifier.sol` is one.
- **EVM** — Ethereum Virtual Machine; a 256-bit stack machine that runs contract bytecode.
- **Opcode** — one EVM instruction (`MLOAD`, `KECCAK256`, `SSTORE`, …).
- **Yul** — a small low-level intermediate language Solidity compiles through; the level our proofs target. See [T1](/solean-learn/ethereum/evm-and-yul/).
- **Storage / Memory / Calldata** — permanent on-chain state / per-call scratch space / read-only call input. FORS reads the signature from **calldata**.
- **Gas** — the per-operation cost paid by the caller. The reason FORS unrolls its loops.
- **`pure`** — a function that reads no state and writes nothing. `recover` is `pure`.
- **keccak-256** — Ethereum's hash function (`KECCAK256` opcode). **Trusted, not proven**, in our scope.
- **ABI** — the encoding convention for calldata/return values (`recover(bytes,bytes32)` is an ABI signature).
- **ECDSA / secp256k1** — Ethereum's current signature scheme; quantum-vulnerable.

## Account abstraction

- **Account abstraction (AA)** — letting a contract's *code* (not a fixed key) decide what authorizes an account.
- **ERC-4337** — the deploy-today AA standard using a separate UserOp mempool, no protocol change.
- **UserOperation / UserOp** — the "pseudo-transaction" struct a user signs in ERC-4337.
- **Bundler** — packages UserOps into a real on-chain transaction. Its outer tx is still ECDSA today (a [non-claim](/solean-learn/aa-pq/why-pq-needs-aa/)).
- **EntryPoint** — the singleton contract that drives validation + execution of UserOps.
- **Smart wallet** — the contract implementing `validateUserOp`; where the verifier is called.
- **EIP-7702** — lets an EOA delegate to wallet code; caveat: the original ECDSA key still works.
- **RIP-7560 / EIP-7701** — directions for *native* (protocol-level) account abstraction.
- **FalconSimpleWallet** — the reference PQ-AA wallet shape SoLean models.

## Post-quantum crypto & FORS

- **Post-quantum (PQ)** — cryptography believed secure against quantum attackers.
- **Hash-based signature** — a signature whose security rests only on a hash function. The conservative PQ choice.
- **Merkle tree** — a tree where each node is the hash of its children; commits to many leaves with one **root**.
- **Authentication path** — the sibling hashes needed to recompute a Merkle root from one leaf.
- **One-time / few-time signature** — safe to use once / a small number of times.
- **WOTS+** — Winternitz one-time signature, a building block of SPHINCS+.
- **FORS** — **F**orest **O**f **R**andom **S**ubsets; the few-time signature our contract verifies. $k$ trees of height $a$. See [T3](/solean-learn/fors/).
- **FORS+C** — FORS with a grinding **counter** ("+C"): a small proof-of-work that hardens it.
- **SPHINCS+ / SLH-DSA** — the stateless many-time hash-based signature (NIST FIPS 205) that wraps FORS.
- **ADRS (address)** — a structured tweak fed into the hash so different positions hash differently.
- **Grinding** — searching a counter until a hash output has a required form (here, a zero field).
- **Falcon-512 / ML-DSA-44** — *lattice*-based PQ schemes SoLean references for scheme discrimination (distinct from FORS, which is hash-based).

## Formal verification & Lean

- **Formal verification** — proving properties with a machine-checked proof.
- **Proof assistant** — software that checks proofs; we use **Lean 4**.
- **Lean 4** — the dependently-typed language + proof assistant this project is written in.
- **Proposition / `Prop`** — a statement; in Lean, a *type* whose terms are proofs.
- **Tactic** — a step that builds a proof (`intro`, `rw`, `simp`, `cases`, `exact`…).
- **Inductive type** — a type defined by a closed set of constructors (how ASTs/data are modeled).
- **Soundness** — "if it says valid, it is valid" — no false accepts. The security-critical direction.
- **Completeness** — "if it is valid, it says valid" — no false rejects.
- **Assumption / oracle** — something taken as given rather than proven (e.g. SoLean's abstract verifier, or keccak).
- **Modeling gap** — the risk that the Lean model doesn't faithfully match the real artifact.
- **Discharge (an assumption)** — replace an assumed fact with a proof of it (what a FORS proof does to SoLean's verifier oracle).

## The tools

- **EVMYulLean** — Nethermind's formal EVM/Yul semantics in Lean (includes a keccak model). [Details](/solean-learn/tooling/evmyullean/).
- **verity** ("jardin") — a verified Lean→Yul compiler; hosts an existing FORS model. [Details](/solean-learn/tooling/verity/).
- **SoLean** — our wallet-logic verification project + methodology. [Details](/solean-learn/tooling/solean/).
