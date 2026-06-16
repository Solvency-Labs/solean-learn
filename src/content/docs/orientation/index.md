---
title: How to use this guide
description: What this site is for, who it's for, and how to get the most out of it.
---

## Why this site exists

We've been handed a concrete task by Antonio Sanso (Ethereum Foundation): **formally verify [`ForsVerifier.sol`](https://github.com/Solvency-Labs/NiceTry/blob/main/src/Verifiers/ForsVerifier.sol)**, a Solidity contract that checks a post-quantum signature.

The hard part isn't any single idea. It's that the task sits at the intersection of *four* unfamiliar worlds at once:

- **Ethereum** — accounts, the EVM, Yul, gas.
- **Account abstraction** — the smart-wallet pattern this verifier plugs into.
- **Post-quantum cryptography** — hash-based signatures and FORS specifically.
- **Formal verification** — Lean 4 and the proof tooling (EVMYulLean, verity).

Most of us are new to at least three of those. This guide is the shared on-ramp: a curated path so the whole team builds the same mental model, in the same vocabulary, pointed at the same goal.

## What this guide is (and isn't)

**It is** a *curated, project-scoped path*. When a great external resource already exists (Lean's own tutorial, the Ethereum docs), we link to it and tell you exactly what to take from it. When the connective tissue or the project-specific part doesn't exist anywhere else (how FORS maps onto *this* contract, how the tools fit together, what "verify" means here), we write it inline.

**It is not** a from-scratch textbook on cryptography, Ethereum, or Lean. There are better books for each. Our value-add is the *path* and the *connections* — the things no single external resource gives you.

## How to read it

- **New to all of this?** Follow [the learning path](/solean-learn/orientation/path/) in order.
- **Need orientation fast?** Read [the stack map](/solean-learn/orientation/stack-map/) — it's the single most important page.
- **Stuck on a word?** The [glossary](/solean-learn/reference/glossary/) collects the dense jargon from all four worlds in one place.
- **Want primary sources?** The [annotated links](/solean-learn/reference/links/) page is the curated reading list, with notes on what to read and what to skip.

## A note on honesty

This project's whole culture is *boundary discipline*: being loud about what is **proven** vs. **assumed** vs. **trusted**. You'll see that everywhere here too. When this guide states something we haven't personally verified against source yet, it says so. If you spot a claim that's wrong or stale, fix it — the [project log](/solean-learn/reference/project-log/) is where we track decisions and open questions.
