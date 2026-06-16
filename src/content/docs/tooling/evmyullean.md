---
title: EVMYulLean
description: Nethermind's formal model of the EVM and Yul in Lean 4 — the ground-truth semantics layer.
---

:::note[Second-hand summary]
This page is based on the repository's README and a first look, not deep use yet. Confirm specifics against the source as we adopt it: [`NethermindEth/EVMYulLean`](https://github.com/NethermindEth/EVMYulLean).
:::

## What it is

**EVMYulLean** (by Nethermind) is *"a formal model of the EVM and Yul in Lean 4."* It gives Lean precise **semantic functions**:

- an EVM `step` function (the opcode-level state machine),
- Yul `exec` / `eval` functions (executing/evaluating Yul),
- the primitive operations both share,
- and a `SpongeHash.lean` — i.e. a **keccak** model lives in-tree.

It also has conformance-testing infrastructure against the Ethereum test suite, so the semantics are checked against real-world expectations, not just asserted.

## Why we care

This is the tool for the **"reason over the real Yul"** route. If you want a theorem about *what the deployed verifier actually computes* — not a hand-made model you hope matches — you reason under EVMYulLean's semantics. It shrinks the **modeling gap** ([see T4](/solean-learn/lean/)) to as small as it gets short of the bytecode itself.

It's also where **keccak** is modeled (`SpongeHash.lean`). That connects directly to our scoping decision: keccak is *given* by this model (assumed/implemented), and we [build on it rather than re-prove it](/solean-learn/task/).

In the finished FORS proof, Lean parses the pinned optimized-Yul artifact into
`forsVerifierRuntime`, then EVMYulLean executes that runtime. The review theorem
says this execution matches the clean FORS+C model; see the
[review path](/solean-learn/project/review-path/).

## Known limitations (it's work-in-progress)

The README is explicit that it's evolving. Things to be aware of when planning:

- **No gas modeling.** (Fine for us — we prove *what* is computed, not gas.)
- `CREATE` / `CREATE2` unsupported; contracts must be placed into state manually.
- Several code-introspection opcodes (`EXTCODESIZE`, `EXTCODEHASH`, `CODECOPY`, …) unimplemented.
- `SELFDESTRUCT` only partial.

For a `pure` verifier that does memory + keccak + returns an address, most of these gaps don't bite — which is part of why FORS is a *tractable* first real target.

## How it relates to the others

- vs. **verity**: EVMYulLean *describes* what Yul means; verity *produces* Yul (and proves its compilation). You can use EVMYulLean to give meaning to verity's output.
- vs. **SoLean**: SoLean currently models a *restricted* Yul of its own for the Counter calibration; EVMYulLean is the path to "real EVM/Yul semantics" that SoLean explicitly lists as not-yet-in-scope.
