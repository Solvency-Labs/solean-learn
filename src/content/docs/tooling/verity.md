---
title: verity
description: A verified Lean→Yul compiler (the "jardin" project) — and the existing FORS model built with it.
---

:::note[Project status]
The FORS proof now lives on [`Solvency-Labs/NiceTry`](https://github.com/Solvency-Labs/NiceTry/tree/main/verity). The Verity-generated verifier is useful background, but the final deployed-runtime theorem is in the EVMYulLean bridge. Start with the [review path](/solean-learn/project/review-path/).
:::

> "verity" is the project; *jardin* is the nickname you may have seen in the kickoff notes (the author, Th0rgal, is French — *jardin* = garden).

## What it is

**verity** is a **compiler written in Lean** that takes a kernel expressed in a Lean DSL, lets you **prove properties about it**, and **compiles it down to Yul**. The `Compiler/` directory is organized into telling subdirectories: `CompilationModel`, `Yul`, `Keccak`, `Proofs`, `Modules`, plus ABI/IR/linking/codegen. Because the compiler itself is in Lean, the compilation step is designed to carry correctness guarantees — not just "trust the codegen."

Test contracts with names like `ERC20MinimalNativeWitness` and `SimpleStorageNativeWitness` hint at the model: write a verified kernel, get a Yul "native witness" out.

## The part that matters most to us: there's already a FORS model

In `NiceTry`'s `verity/` directory, there is a **formally modeled FORS+C recovery model** plus Verity-generated helper kernels. It includes:

- `NiceTry/Fors/Types.lean` — signature structures and constants
- `NiceTry/Fors/Model.lean` — recovery logic + raw-signature parsing
- `NiceTry/Fors/TreeShape.lean` — one-tree reconstruction
- `NiceTry/Fors/FullKeccak.lean` — the full verifier: all trees + address derivation
- `NiceTry/Fors/RawKeccak.lean` — parser bridging raw bytes → typed recovery
- `NiceTry/Fors/Proofs/` — structural properties, path arithmetic, memory-transcript checks

It also has generated Yul helper artifacts (guard kernel, tree-shape kernel,
tree-keccak kernel, full verifier) and Foundry replay tests against concrete
vectors.

Reported guarantees already include: *non-2448-byte signatures are rejected*, and *a signature can recover a non-zero signer only when the omitted FORS tree index is forced to zero.*

## Why this is huge for the task

It means the hard **modeling** work — turning FORS into a typed Lean object — is
done enough to serve as the clean model for the real verifier proof.

But keep the distinction clear:

- the **real verifier** is `ForsVerifier.sol` compiled to pinned optimized Yul
  and executed in EVMYulLean;
- the **Verity-generated verifier** is a helper/reference version.

The helper verifier has its own checklist. Nine of eleven items are proved; the
two remaining items are about its own large loop and are not dependencies of the
final theorem about the real verifier.

## How it relates to the others

- vs. **EVMYulLean**: verity helps define/prove the clean FORS model and helper
  kernels; EVMYulLean gives meaning to the real optimized Yul produced from
  `ForsVerifier.sol`.
- vs. **SoLean**: SoLean keeps the verifier abstract; the FORS model gives the
  concrete `recover` behavior that the wallet layer can eventually connect to.
