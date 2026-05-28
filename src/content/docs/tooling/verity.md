---
title: verity
description: A verified Lean→Yul compiler (the "jardin" project) — and the existing FORS model built with it.
---

:::note[Second-hand summary]
Based on the repos' structure and a first look, not deep use yet. Confirm against source: the compiler [`Th0rgal/verity`](https://github.com/Th0rgal/verity/tree/main/Compiler) and the FORS model on the [`fors-verity-model` branch](https://github.com/RivaLabs-Core/NiceTry/tree/fors-verity-model/verity).
:::

> "verity" is the project; *jardin* is the nickname you may have seen in the kickoff notes (the author, Th0rgal, is French — *jardin* = garden).

## What it is

**verity** is a **compiler written in Lean** that takes a kernel expressed in a Lean DSL, lets you **prove properties about it**, and **compiles it down to Yul**. The `Compiler/` directory is organized into telling subdirectories: `CompilationModel`, `Yul`, `Keccak`, `Proofs`, `Modules`, plus ABI/IR/linking/codegen. Because the compiler itself is in Lean, the compilation step is designed to carry correctness guarantees — not just "trust the codegen."

Test contracts with names like `ERC20MinimalNativeWitness` and `SimpleStorageNativeWitness` hint at the model: write a verified kernel, get a Yul "native witness" out.

## The part that matters most to us: there's already a FORS model

On `NiceTry`'s **`fors-verity-model`** branch, a `verity/` directory contains a **formally modeled FORS+C recovery kernel** built with verity. From a first look it includes:

- `NiceTry/Fors/Types.lean` — signature structures and constants
- `NiceTry/Fors/Model.lean` — recovery logic + raw-signature parsing
- `NiceTry/Fors/TreeShape.lean` — one-tree reconstruction
- `NiceTry/Fors/FullKeccak.lean` — the full verifier: all trees + address derivation
- `NiceTry/Fors/RawKeccak.lean` — parser bridging raw bytes → typed recovery
- `NiceTry/Fors/Proofs/` — structural properties, path arithmetic, memory-transcript checks

It compiles to Yul artifacts (guard kernel, tree-shape kernel, tree-keccak kernel, full verifier) and exposes an **ABI-compatible `recover(bytes,bytes32)`** tested against concrete vectors in Foundry.

Reported guarantees already include: *non-2448-byte signatures are rejected*, and *a signature can recover a non-zero signer only when the omitted FORS tree index is forced to zero.*

## Why this is huge for the task

It means the hard **modeling** work — turning FORS into a typed Lean object that compiles to Yul — is **substantially started**. Our task is far more "understand, audit, strengthen, and connect this" than "build from scratch." When we [decided this is a pivot in tooling, not a teardown](/solean-learn/task/), *this* model is the prior art that makes the new tools the right home for the work.

## How it relates to the others

- vs. **EVMYulLean**: verity *emits* Yul with proofs about the compilation; EVMYulLean *gives meaning* to Yul. They meet if you interpret verity's output under EVMYulLean's semantics.
- vs. **SoLean**: SoLean keeps the verifier abstract; verity's FORS model *is* a concrete verifier. The verity proof is a candidate for discharging SoLean's verifier oracle.
