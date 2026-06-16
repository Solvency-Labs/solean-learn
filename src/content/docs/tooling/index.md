---
title: Three tools, one stack
description: How EVMYulLean, verity, and SoLean fit together — and which job each one does.
---

Three Lean-based tools show up in this project. They are *not* competitors; they cover different jobs on [the stack map](/solean-learn/orientation/stack-map/). Here's the map before the detail.

| Tool | One-line job | Where it sits |
| --- | --- | --- |
| **[EVMYulLean](/solean-learn/tooling/evmyullean/)** | Formal semantics of the EVM and Yul, in Lean | the *ground truth* for what compiled code does |
| **[verity](/solean-learn/tooling/verity/)** | A verified compiler from a Lean DSL down to Yul | the *reimplementation* route — and home of an existing FORS model |
| **[SoLean](/solean-learn/tooling/solean/)** | Contract-logic proofs for AA/PQ wallets, verifier abstracted | the *wallet layer* + the project's methodology |

## Two routes to "verify the contract"

There are two complementary strategies, and the tools line up with them:

1. **Reason over the real Yul** — take what `ForsVerifier.sol` compiles to and prove things about it under **EVMYulLean**'s semantics. Closest to "verify the actual artifact," highest fidelity, hardest.

2. **Verified reimplementation** — write the FORS verifier in **verity**'s Lean DSL, prove it correct, and compile it to Yul; then argue the result matches the deployed contract.

The final FORS result uses route 1 for the deployed verifier. EVMYulLean executes
the runtime imported from pinned optimized Yul and proves it matches the clean
FORS+C model. The Verity-generated verifier remains useful as a helper/reference
version, but it is not the deployed runtime theorem. See the
[review path](/solean-learn/project/review-path/) for the plain distinction.

## And SoLean?

SoLean is the **outer layer and the methodology**. It proves the *wallet* logic correct while treating the verifier as an abstract oracle. The finished FORS proof is what lets that oracle assumption be connected to a real verifier. That's the "two layers, one stack" idea from the stack map — keep it in mind as you read the three tool pages.

Read them in any order, but if you only read one, read [SoLean](/solean-learn/tooling/solean/) — it's *our* project and it frames the whole effort.
