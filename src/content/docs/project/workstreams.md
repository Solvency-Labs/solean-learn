---
title: Workstreams & repos
description: Where the work lives now, who owns what, and how to contribute — the verification work has moved out of the SoLean repo.
---

We started with everyone in the **SoLean** repo. The real verification work has since moved into the **verity FORS model + our Bridge layer**, so here's the current map. The rule of thumb: **plan here on the learn site, code in the fork.**

## Repo map

| Repo | Role | Where work happens |
|---|---|---|
| **`Solvency-Labs/solean-learn`** (this site) | Team hub — onboarding, [roadmap](/solean-learn/project/roadmap/), [log](/solean-learn/reference/project-log/), [changelog](/solean-learn/project/changelog/). **Single source of truth for plans & status.** | Docs/MDX |
| **`Solvency-Labs/NiceTry`** (fork of `RivaLabs-Core/NiceTry`) | **The verification work.** The FORS model + the EVMYulLean proof for the real verifier. | `verity/NiceTry/Fors/` (model) and `verity/NiceTry/Fors/Bridge/` (proof). **Current branch: `main`**. **Start at `Bridge/REVIEW_PATH.md`, then `Bridge/ReviewSurface.lean`.** |
| **`Solvency-Labs/SoLean`** | Methodology + the wallet-layer model. Its `PQVerifierWrapper` oracle is the slot a finished FORS proof discharges. **No longer the main dev locus.** | `SoLean/` |
| `lfglabs-dev/EVMYulLean`, `Th0rgal/verity` | Upstream deps — real Yul/EVM semantics + the Lean→Yul compiler. | Read; occasional PRs (e.g. expose the public word-codec theorem now wrapped locally) |

## The fork (why and how)

The FORS work lives on a RivaLabs branch we can't push to. So we **fork it under our org** — the team gets read/write, full git history and the in-repo Foundry replay survive, and we keep an upstream link to pull RivaLabs' model updates.

```bash
# one-time, by an org admin
gh repo fork RivaLabs-Core/NiceTry --org Solvency-Labs --clone=false

# in an existing clone, point a remote at the fork and push our work
git -C NiceTry remote add solvency git@github.com:Solvency-Labs/NiceTry.git
git -C NiceTry push solvency main

# sync from upstream later
git -C NiceTry fetch origin && git -C NiceTry merge origin/main
```

> Note: a fork of a public repo is **public**. That's fine for research; if you need it private, duplicate into a fresh private repo instead of forking.

## Contribute to the verification work

```bash
git clone git@github.com:Solvency-Labs/NiceTry.git
cd NiceTry
git checkout main
cd verity
lake exe cache get            # mathlib oleans (fast)
lake build NiceTry            # builds the model + Bridge

# build just one bridge module
lake build NiceTry.Fors.Bridge.AddressShape
```

> ⚠️ **Always build the named target `NiceTry`.** A bare `lake build` compiles *nothing* (the lakefile has no `@[default_target]`) and still exits 0 — a false green. After touching a proof, also re-run `#print axioms <thm>` to confirm the trust surface is unchanged.

Branch from `main` on the fork. Keep proofs **`sorry`-free**;
if you add an assumption, make it an explicit `axiom` in a labeled section and
note it in the [trust surface](#trust-surface).

## What's in `Bridge/` today

The branch builds green; individual completion status is noted below and in the [roadmap](/solean-learn/project/roadmap/):

- **`REVIEW_PATH.md`** — **start here for review.** The plain path from model to pinned artifact to theorem.
- **`ReviewSurface.lean`** — the small theorem surface: `pinned_yul_runtime_matches_recover_model` and supporting wrappers.
- **`PICKUP.md`** — engineering handoff: build gotchas, what's done, and lower-level proof context.
- `Oracle.lean`, `Equivalence.lean` — SoLean oracle discharge + the refinement-sufficiency theorem.
- `MemoryLayout.lean` — Class-C layout/non-overlap facts.
- `ByteArrayLemmas.lean` — the `ByteArray.write`/`readWithPadding` library + `writeWords32_data`.
- `EvmMemory.lean` — `MachineState.mstore` → keccak-input bytes.
- `AddressShape.lean` — **all five transcript shapes** closed EVM→model (address/hmsg/leaf/node/roots) + the roots→`recoverRoot` handoff skeleton.
- `EvmFfiSpec.lean` — proved zero-padding and word-codec facts; no project axioms.
- `InterpKeccak.lean`, `AddressShape.lean` — the explicit trusted-spec layer
  (2 labeled project axioms declared on the current branch).
- **`TranscriptEncoding.lean`** — canonical transcript bytes plus proved
  address/hmsg/leaf/node/roots encoding equalities; five bundled Keccak axioms
  are reduced to one generic `evm_keccak_transcript`.
- **`Refinement.lean`** — reduces `ForsRefines` to three named execution facts (`h_len`/`h_guard`/`h_accept`); zero added trust.
- **`Phase4Accept.lean`, `Phase4Reject.lean`, `Phase4.lean`** — close the three
  execution branches and export `phase4_forsRefines : ForsRefines`.
- **`DispatcherRoute.lean`** — proves the reviewed selector/ABI route into
  `fun_recover`; `dispatcher_routes_to_recover` is a theorem, not an assumption.
- **`ForsYulArtifact.lean`, `YulParser.lean`, `ParsedRuntime.lean`** — the total
  Lean parser/importer for the pinned optimized-Yul artifact and the theorem that
  it imports to `forsVerifierRuntime`.
- **`ForsRuntime.lean`, `EvmRun.lean`** — the EVMYulLean runtime and `evmRun`
  interpreter invocation (account-install bug fixed).
- **`Interp.lean`, `InterpOps.lean`, `InterpState.lean`, `InterpCall.lean`, `InterpEval.lean`** — the interpreter-stepping foundation: reduction lemmas for every construct in the dispatcher + `fun_recover` (control flow, builtins, stateful ops, user-calls/switch, expression composition).
- **`TreeLeaf.lean` through `TreeLoop.lean`** — complete symbolic execution and 25-step induction for the real tree loop, including all root-buffer writes.
- **`TreeCalldata.lean`** — general payload extraction, masked calldata reads, and the `loopSk`/`loopSib` bridge to model openings.
- **`TreeFinal.lean`** — post-loop roots compression, address derivation, and return machinery.
- **`TreePreLoop.lean`** — padding-store calculus and hmsg keccak-window facts.
- **`TreeEntry.lean`, `TreeEntryFront.lean`** — the complete statement-level pre-loop trace through the hmsg stores, forced-zero skip, loop-variable initialization, and `LoopInv 0`.
- `OBLIGATIONS.md`, `CLASS-M.md` — the discharge plan + the three-layer architecture.

The current open edge is trust hardening and production rollout: upstream the
public codec wrapper, decide the long-term treatment of the 32-byte Keccak
extern contract, and check the actual deployed address. The bundled
keccak/encoding assumptions are split and the padding/codec facts are proved.
The Verity-generated helper verifier has 9 of 11 checklist items proved; the two
remaining helper-loop items are documented background, not dependencies of the
main theorem.

For reviewer handoff, start with the [review path](/solean-learn/project/review-path/)
and then the [verification report](/solean-learn/project/verification-report/).

## Trust surface

Everything checks down to Lean's core (`propext`, `Classical.choice`, `Quot.sound`) **plus** these explicit, labeled assumptions — keep this list short and honest:

- **generic Keccak bridge** (×1) — `evm_keccak_transcript`; the canonical
  transcript encoding and output masking are proved.
- **Keccak FFI shape** (×1) — `ffi_kec_size`, stating that the extern returns
  exactly 32 bytes. `ffi_kec_lt` is derived from it.

None of these are cryptographic-hardness assumptions.
