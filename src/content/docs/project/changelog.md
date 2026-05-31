---
title: Changelog
description: Dated, team-facing updates — what shipped, what changed, what's next. Newest first.
---

Bigger-picture than the append-only [Project log](/solean-learn/reference/project-log/) (which is decisions + open questions). This is the "what happened and what it means for you" feed.

## 2026-06-01 — Direction locked, foundation proved, work moves to the fork

**TL;DR.** We audited the existing FORS model, picked our route, and proved the first end-to-end slice of the real goal. The verification work now lives in a **fork of NiceTry under our org**, not the SoLean repo. New [roadmap](/solean-learn/project/roadmap/) and [workstreams map](/solean-learn/project/workstreams/) are up.

**What we learned (Phase 1).** The verity FORS model is in far better shape than we feared: its structural Lean proofs are **fully closed (zero `sorry`)** and it already compiles to Yul with a Foundry replay against the real contract. The gap is precise — **12 `local_obligations`** at the Verity→Yul boundary, and no proof yet linking the *hand-written* `ForsVerifier.sol` to the model.

**Decisions.** We're going **route B**: certify the deployed hand-written contract via an **EVMYulLean equivalence** (vs shipping a verified-by-construction replacement). Target is **spec-correctness conditional on trusted keccak** — not cryptographic soundness. All six prior open questions are now resolved (see the [log](/solean-learn/reference/project-log/)).

**What's proved (Phases 2–3).** The SoLean oracle discharge + refinement-sufficiency theorem, a from-scratch `ByteArray`/memory lemma library, and the **address transcript closed end-to-end** (EVM execution → keccak → the model's `addressFromRoot`). All `sorry`-free, with the trust surface localized to a handful of labeled axioms.

**What changes for you.**
- **New home:** code work happens in `Solvency-Labs/NiceTry` (fork), branch `fors-verity-model`, under `verity/NiceTry/Fors/Bridge/`. The SoLean repo is now the *methodology + oracle interface* layer, not the dev locus. Setup in [Workstreams](/solean-learn/project/workstreams/).
- **New goals:** Phase 4 is open for claiming — the **hmsg/leaf/node** shapes (mechanical now, template exists) and the harder **roots loop / full-contract execution** model.
- **Still pending:** Antonio to confirm route B + the "what counts as verified" bar.

**Grab a workstream** on the [Project log](/solean-learn/reference/project-log/).

## 2026-05-28 — Project kickoff
Kickoff with Antonio Sanso: verify `ForsVerifier.sol`. Decisions: keccak trusted, tooling pivot to verity + EVMYulLean. This learning site stood up. (See the [Project log](/solean-learn/reference/project-log/).)
