---
title: Project log
description: Living record of decisions made and open questions — so the team stays in sync and newcomers can see the current state.
---

A lightweight, append-only record of **decisions** and **open questions**. Newest first. This is where the [task page's](/solean-learn/task/) open threads get tracked and resolved. Keep entries short; link out for detail.

## Open questions

These are live. Claim one, resolve it, then move it to "Decisions" with the outcome.

1. **What does "verify" mean to Antonio** — spec-correctness, soundness, or both? *(blocks scope)*
2. **Which route** — reason over real Yul (EVMYulLean), reimplement in verity, or both? *(blocks tooling setup)*
3. **Where does our work live** — extend the `fors-verity-model` branch, or model inside SoLean?
4. **How complete is the existing verity FORS model?** Read `NiceTry/Fors/` end to end and report coverage.
5. **Contract parameters/steps audit** — confirm or correct the numbers on [FORS, line by line](/solean-learn/fors/the-contract/) against the real source. *(several pages here are marked "verify against source")*
6. **Composition interface** — what verifier shape lets a FORS proof discharge SoLean's `Verifier(pk,msg,sig)` oracle? (boolean-over-words vs recover-and-compare-address)

## Decisions

### 2026-05-28 — keccak is trusted, not proven
We do **not** re-prove keccak; it's taken as a correct primitive (modeled in EVMYulLean's `SpongeHash`, used by verity). Rationale: it reduces FORS verification to *structural* reasoning (parsing, tree-climbing, index math), making the task tractable. Source: kickoff with Antonio Sanso.

### 2026-05-28 — this is a tooling pivot, not a teardown
The FORS work happens in the native tools (verity + EVMYulLean), **not** by extending SoLean's DSL to handle bytes/Merkle. SoLean is kept as the *outer wallet layer* and the *methodology*; its abstract verifier oracle is the slot a finished FORS proof discharges. See [SoLean](/solean-learn/tooling/solean/) and [the task](/solean-learn/task/).

### 2026-05-28 — build this learning guide
Stood up this site (Astro Starlight) so the whole team can go noob→expert on the four worlds (Ethereum, AA, PQ/FORS, Lean) the task spans.

## How to add an entry

Append under the right heading with a date (`YYYY-MM-DD`). For a decision, include the **rationale** and a **source** (meeting, doc, or proof). For resolving an open question, move it down to Decisions with the outcome. Keep it to a few lines — this is an index of what changed, not a wiki.
