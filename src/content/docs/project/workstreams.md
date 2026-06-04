---
title: Workstreams & repos
description: Where the work lives now, who owns what, and how to contribute — the verification work has moved out of the SoLean repo.
---

We started with everyone in the **SoLean** repo. The real verification work has since moved into the **verity FORS model + our Bridge layer**, so here's the current map. The rule of thumb: **plan here on the learn site, code in the fork.**

## Repo map

| Repo | Role | Where work happens |
|---|---|---|
| **`Solvency-Labs/solean-learn`** (this site) | Team hub — onboarding, [roadmap](/solean-learn/project/roadmap/), [log](/solean-learn/reference/project-log/), [changelog](/solean-learn/project/changelog/). **Single source of truth for plans & status.** | Docs/MDX |
| **`Solvency-Labs/NiceTry`** (fork of `RivaLabs-Core/NiceTry`) | **The verification work.** The verity FORS model + our EVMYulLean equivalence. | `verity/NiceTry/Fors/` (model) and `verity/NiceTry/Fors/Bridge/` (ours). **Active branch: `evmrun-runtime`** (has the Bridge, `evmRun`, and the interpreter-stepping foundation; `fors-verity-model` is the shape-only base). **Start at `Bridge/PICKUP.md`.** |
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
cd NiceTry
git checkout evmrun-runtime   # the active branch
cd verity
lake exe cache get            # mathlib oleans (fast)
lake build NiceTry            # builds the model + Bridge

# build just one bridge module
lake build NiceTry.Fors.Bridge.AddressShape
```

> ⚠️ **Always build the named target `NiceTry`.** A bare `lake build` compiles *nothing* (the lakefile has no `@[default_target]`) and still exits 0 — a false green. After touching a proof, also re-run `#print axioms <thm>` to confirm the trust surface is unchanged.

Work on a branch, open a PR into `evmrun-runtime` on the fork. Keep proofs **`sorry`-free**; if you add an assumption, make it an explicit `axiom` in a labeled section and note it in the [trust surface](#trust-surface).

## What's in `Bridge/` today

All proved and building green (see the [roadmap](/solean-learn/project/roadmap/) for status):

- **`PICKUP.md`** — **start here.** Branch/build gotchas, what's done, and the remaining work split into claimable bricks.
- `Oracle.lean`, `Equivalence.lean` — SoLean oracle discharge + the refinement-sufficiency theorem.
- `MemoryLayout.lean` — Class-C layout/non-overlap facts.
- `ByteArrayLemmas.lean` — the `ByteArray.write`/`readWithPadding` library + `writeWords32_data`.
- `EvmMemory.lean` — `MachineState.mstore` → keccak-input bytes.
- `AddressShape.lean` — **all five transcript shapes** closed EVM→model (address/hmsg/leaf/node/roots) + the roots→`recoverRoot` handoff skeleton.
- `EvmFfiSpec.lean` — the trusted-axiom layer (the 9-axiom trust base).
- **`Refinement.lean`** — reduces `ForsRefines` to three named execution facts (`h_len`/`h_guard`/`h_accept`); zero added trust.
- **`ForsRuntime.lean`, `EvmRun.lean`** — the deployed contract transcribed to the EVMYulLean DSL + `evmRun` (the interpreter invocation; account-install bug fixed).
- **`Interp.lean`, `InterpOps.lean`, `InterpState.lean`, `InterpCall.lean`, `InterpEval.lean`** — the interpreter-stepping foundation: reduction lemmas for every construct in the dispatcher + `fun_recover` (control flow, builtins, stateful ops, user-calls/switch, expression composition).
- `OBLIGATIONS.md`, `CLASS-M.md` — the discharge plan + the three-layer architecture.

## Trust surface

Everything checks down to Lean's core (`propext`, `Classical.choice`, `Quot.sound`) **plus** these explicit, labeled assumptions — keep this list short and honest:

- **keccak** — trusted, not proved (kickoff decision). Currently via `evm_keccak_address` (also bundles the 16-byte masking; to be split).
- **`ffi.ByteArray.zeroes` specs** (×3) — total-correctness of the opaque EVM memory-padding primitive.
- **`uint256_toByteArray_size`** — true & provable, but EVMYulLean's lemma is `private`; tracked until an upstream PR discharges it.

None of these are cryptographic-hardness assumptions.
