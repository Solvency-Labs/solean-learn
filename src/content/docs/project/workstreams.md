---
title: Workstreams & repos
description: Where the work lives now, who owns what, and how to contribute — the verification work has moved out of the SoLean repo.
---

We started with everyone in the **SoLean** repo. The real verification work has since moved into the **verity FORS model + our Bridge layer**, so here's the current map. The rule of thumb: **plan here on the learn site, code in the fork.**

## Repo map

| Repo | Role | Where work happens |
|---|---|---|
| **`Solvency-Labs/solean-learn`** (this site) | Team hub — onboarding, [roadmap](/solean-learn/project/roadmap/), [log](/solean-learn/reference/project-log/), [changelog](/solean-learn/project/changelog/). **Single source of truth for plans & status.** | Docs/MDX |
| **`Solvency-Labs/NiceTry`** (fork of `RivaLabs-Core/NiceTry`) | **The verification work.** The verity FORS model + our EVMYulLean equivalence. | `verity/NiceTry/Fors/` (model) and `verity/NiceTry/Fors/Bridge/` (ours) on branch `fors-verity-model` |
| **`Solvency-Labs/SoLean`** | Methodology + the wallet-layer model. Its `PQVerifierWrapper` oracle is the slot a finished FORS proof discharges. **No longer the main dev locus.** | `SoLean/` |
| `lfglabs-dev/EVMYulLean`, `Th0rgal/verity` | Upstream deps — real Yul/EVM semantics + the Lean→Yul compiler. | Read; occasional PRs (e.g. de-privatize `toBytes'_le`) |

## The fork (why and how)

The FORS work lives on a RivaLabs branch we can't push to. So we **fork it under our org** — the team gets read/write, full git history and the in-repo Foundry replay survive, and we keep an upstream link to pull RivaLabs' model updates.

```bash
# one-time, by an org admin
gh repo fork RivaLabs-Core/NiceTry --org Solvency-Labs --clone=false

# in an existing clone, point a remote at the fork and push our work
git -C NiceTry remote add solvency git@github.com:Solvency-Labs/NiceTry.git
git -C NiceTry push solvency fors-verity-model

# sync from upstream later
git -C NiceTry fetch origin && git -C NiceTry merge origin/fors-verity-model
```

> Note: a fork of a public repo is **public**. That's fine for research; if you need it private, duplicate into a fresh private repo instead of forking.

## Contribute to the verification work

```bash
git clone git@github.com:Solvency-Labs/NiceTry.git
cd NiceTry/verity
lake exe cache get            # mathlib oleans (fast)
lake build                    # builds the model + Bridge

# build just our bridge modules
lake build NiceTry.Fors.Bridge.AddressShape
```

Work on a branch, open a PR into `fors-verity-model` on the fork. Keep proofs **`sorry`-free**; if you add an assumption, make it an explicit `axiom` in a labeled section and note it in the [trust surface](#trust-surface).

## What's in `Bridge/` today

All proved and building green (see the [roadmap](/solean-learn/project/roadmap/) for status):

- `Oracle.lean`, `Equivalence.lean` — SoLean oracle discharge + the refinement-sufficiency theorem.
- `MemoryLayout.lean` — Class-C layout/non-overlap facts.
- `ByteArrayLemmas.lean` — the `ByteArray.write`/`readWithPadding` library + `writeWords32_data`.
- `EvmMemory.lean` — `MachineState.mstore` → keccak-input bytes.
- `AddressShape.lean` — the address transcript closed EVM→model.
- `EvmFfiSpec.lean` — the trusted-axiom layer.
- `OBLIGATIONS.md`, `CLASS-M.md` — the discharge plan + the three-layer architecture.

## Trust surface

Everything checks down to Lean's core (`propext`, `Classical.choice`, `Quot.sound`) **plus** these explicit, labeled assumptions — keep this list short and honest:

- **keccak** — trusted, not proved (kickoff decision). Via **5 per-shape bridges** (`evm_keccak_address/hmsg/leaf/node/roots`), each guarded by the byte-encoding hypothesis. They currently also fold in the 16-byte masking (Gap B); a later refinement splits that out into proofs, leaving keccak-only axioms.
- **`ffi.ByteArray.zeroes` specs** (×3) — total-correctness of the opaque EVM memory-padding primitive.
- **`uint256_toByteArray_size`** — true & provable, but EVMYulLean's lemma is `private`; tracked until an upstream PR discharges it.

None of these are cryptographic-hardness assumptions.
