---
title: The learning path
description: A suggested order and rough time budget to go from zero to contributing.
---

A suggested order for someone starting cold. Time estimates are per person, assuming a few focused hours a day. Adjust to your background — if you already know Ethereum, skip T1.

## Phase 1 — The domain (why this contract exists)

| Track | What you'll be able to do | Rough time |
| --- | --- | --- |
| [T1 · Ethereum & the EVM](/solean-learn/ethereum/) | Explain accounts, gas, storage vs. memory vs. calldata, and read simple Yul. | 2–3 days |
| [T2 · Account abstraction & PQ](/solean-learn/aa-pq/) | Explain ERC-4337 and *why* PQ Ethereum rides on account abstraction. | 2 days |
| [T3 · Hash-based sigs & FORS](/solean-learn/fors/) | Explain Merkle trees, hash-based signatures, and read `ForsVerifier.sol`. | 3 days |

**Phase 1 checkpoint:** you can walk a teammate through what `recover(sig, digest)` does, step by step, and say why each keccak call is there.

## Phase 2 — The tools (how we prove things)

| Track | What you'll be able to do | Rough time |
| --- | --- | --- |
| [T4 · Lean 4 & verification](/solean-learn/lean/) | Read a Lean definition and a simple proof; explain soundness vs. completeness. | 1–2 weeks (the deep one) |
| [T5 · The tooling](/solean-learn/tooling/) | Explain what EVMYulLean, verity, and SoLean each give us. | ~1 week |

**Phase 2 checkpoint:** you can open the verity FORS model and roughly follow what each file is responsible for.

## Phase 3 — The task (do the work)

| Track | What you'll be able to do | Time |
| --- | --- | --- |
| [T6 · The task](/solean-learn/task/) | State precisely what we're proving, what's trusted, and pick up an open thread. | ongoing |

**Phase 3 checkpoint:** you've claimed something from the [project log](/solean-learn/reference/project-log/) and can defend why your piece is in scope.

## Don't do this alone

Two habits that make the path much faster:

1. **Teach as you go.** The checkpoints above are "can you explain it to someone else" on purpose. If you can't, you don't know it yet.
2. **Keep the [glossary](/solean-learn/reference/glossary/) open.** Four fields' worth of jargon collides in this project. Looking a word up the moment it appears beats pretending.
