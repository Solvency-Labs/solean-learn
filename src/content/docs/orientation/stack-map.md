---
title: The stack, in one picture
description: How the EVM, FORS, keccak, Lean, verity, and EVMYulLean all relate — and where our task sits.
---

If you remember one thing from this guide, make it this picture.

```
   UserOp ──▶  AA smart wallet          validates: entry-point · nonce · domain · replay
                    │                    (SoLean-style proofs live here)
                    │ calls
                    ▼
              FORS verifier              recover(bytes sig, bytes32 digest) → address
                    │                    ◀── THIS is the contract we must verify
                    │ uses
                    ▼
                 keccak-256              ◀── TRUSTED. We do NOT re-prove this.
                    ▲
                    │ everything above is modeled & proven in
                    │
   Lean 4   ·   verity (Lean → Yul)   ·   EVMYulLean (EVM / Yul semantics)
```

## Reading it top to bottom

**The wallet (top).** Post-quantum signatures reach Ethereum today by routing transactions through a smart-contract wallet that authenticates them — instead of waiting for the EVM itself to learn new cryptography. The wallet does the "boring" checks: is this the right caller, is the nonce fresh (anti-replay), is the domain right. Then it asks the verifier: *is this signature actually valid?* Track [T2](/solean-learn/aa-pq/) covers this layer.

**The FORS verifier (middle) — our task.** This is the contract that answers "is the signature valid?". It takes a signature and a message digest and returns the **address** that must have signed. FORS is a *few-time* hash-based signature; the verifier is essentially a walk up a forest of Merkle trees made of keccak hashes. Tracks [T3](/solean-learn/fors/) (the math) and [T6](/solean-learn/task/) (the task) cover this.

**keccak (the floor) — trusted.** Everything FORS does bottoms out in one hash function, keccak-256. A key scoping decision from the kickoff: **we treat keccak as already-correct and do not prove it.** That's what makes the task tractable — once keccak is a black box, verifying the contract is about *structure* (byte layout, tree-climbing, index math), not cryptographic internals. More in [T6](/solean-learn/task/).

**The tools (the platform).** We prove things in **Lean 4**, a proof assistant. **EVMYulLean** gives Lean a model of EVM/Yul semantics so we can reason about the *actual* compiled contract. **verity** is a verified compiler from Lean down to Yul — and there's already a FORS model built with it. Track [T5](/solean-learn/tooling/) covers all three.

## Why this layering matters

The layers are *independent jobs*. You can prove the wallet logic correct while treating the verifier as a black box (that's what SoLean does today). You can prove the verifier correct while treating keccak as a black box (that's our task). And a finished FORS proof is exactly the thing that lets the wallet layer stop *assuming* "the verifier works" and start *knowing* it.

That's the strategic punchline: **the FORS proof discharges the assumption the wallet layer currently makes.** Two layers, one stack — not two competing projects.
