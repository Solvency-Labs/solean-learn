---
title: SoLean
description: Our own project — contract-logic verification for PQ account-abstraction wallets, and the boundary-discipline methodology.
---

**SoLean** (Solidity + Lean) is *our* project. It does AI-assisted formal verification of **Solidity contract logic** in Lean 4, aimed at **post-quantum account abstraction**. Understanding it frames the whole effort, because the FORS task plugs into it.

## What SoLean verifies (and what it doesn't)

SoLean proves things about the **wallet/wrapper logic** — the top layer of [the stack map](/solean-learn/orientation/stack-map/):

- An **AA wallet** validation model: success implies the entry-point, nonce, domain, and verifier checks passed, and the nonce advanced via checked arithmetic.
- A **PQ verifier wrapper** model: success implies key-length, signature-length, and domain checks passed.
- An **integration** of the two, with replay-resistance, a modeled EVM `CALL` boundary, a first-cut gas dimension, and structural no-reentrancy.
- A **FalconSimpleWallet**-shaped deployment view (the reference wallet shape), with scheme discrimination (Falcon-512 vs ML-DSA-44).

Crucially, **the verifier itself is an abstract oracle.** SoLean proves "the wallet calls the verifier correctly and only executes if it accepts" — *assuming* a predicate `Verifier(pk, msg, sig)`. It explicitly does **not** claim: real PQ cryptographic security, byte-level ABI parsing, real keccak, or real solc-Yul equivalence.

## The methodology (the transferable part)

Even more than the proofs, SoLean's **boundary discipline** is what transfers to the FORS work:

- **Explicit non-claims** — every boundary the project does *not* cross is named out loud (bundler ECDSA dependence, EIP-7702, real ABI parsing, gas schedule…).
- **A crypto-assumption graph** — each named assumption is linked to the exact theorems it supports, checked both in Lean and by an audit script, so an assumption can't silently float free.
- **Source certificates & behavior summaries** — Lean-owned artifacts describing the contract shape and the ordered guards per phase, with theorem references, cross-checked against a restricted Solidity sketch.

This "say exactly what's proven vs assumed vs trusted" culture is the same lens you'll apply to FORS.

## Where FORS fits

SoLean's abstract `Verifier(pk, msg, sig)` oracle is *precisely the slot a verified FORS verifier fills.* Today SoLean proves the wallet is safe **under an abstract verifier assumption**. A finished FORS proof turns that into **under a real, verified verifier** — discharging the assumption.

That's the strategic shape of the whole project: SoLean is the wallet layer and the method; FORS (via [verity](/solean-learn/tooling/verity/) / [EVMYulLean](/solean-learn/tooling/evmyullean/)) is the concrete verifier that completes the bottom of the story. [The task page](/solean-learn/task/) makes the composition — and its rough edges — concrete.

## Where to look in the repo

- `docs/pq-aa-roadmap.md` — the phased plan (we're heading into the "concrete verifier" phase).
- `SoLean/Examples/` — the AA wallet, wrapper, integration, and FalconSimpleWallet models.
- `docs/assumptions.md` — the named assumptions and boundaries.
