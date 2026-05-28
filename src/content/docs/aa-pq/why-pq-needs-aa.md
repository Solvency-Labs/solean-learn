---
title: Why PQ Ethereum rides on AA
description: Antonio Sanso's thesis — post-quantum transactions become deployable today through account abstraction — and the caveats.
---

This page is the *strategic* reason the project exists. It's worth understanding well, because it explains why we're verifying a Solidity contract at all instead of, say, a precompile.

## The threat

Ethereum EOAs authenticate with **ECDSA** over secp256k1. A large enough quantum computer running Shor's algorithm breaks ECDSA: it can recover a private key from a public key. Since spending from an account reveals its public key, "harvest now, decrypt later" makes this a real long-horizon risk for stored value.

Ethereum needs to migrate to **post-quantum (PQ)** signatures — schemes believed secure against quantum attackers. Hash-based signatures (the family FORS belongs to) are the most conservative choice: their security rests only on the hash function.

## The deployment problem — and Antonio's thesis

Changing the *protocol's* native signature scheme is slow and contentious (a hard fork, new precompiles, coordination across the whole ecosystem). Antonio Sanso's argument — *"The road to Post-Quantum Ethereum transactions is paved with Account Abstraction"* — is that you **don't have to wait**:

> Because an AA smart wallet decides its own validity rule in *code*, you can deploy a wallet today whose rule is "valid iff this **PQ** signature verifies." No protocol change required.

So the migration path is: **PQ verifier contracts + account-abstraction wallets**, not a new precompile. That is precisely why our verification target is a *Solidity/Yul contract* (`ForsVerifier.sol`) rather than EVM internals. The useful thing to verify is the **contract boundary**.

```
the question that matters:
  can a UserOp execute WITHOUT satisfying the intended
  PQ-authentication + nonce + domain conditions?
```

## Two caveats the project is loud about

Honest scoping means naming what this does *not* solve. Both are treated as explicit **non-claims**:

- **The bundler's ECDSA dependence.** With ERC-4337, the UserOp can be PQ-authenticated at the wallet — but the *outer* bundler transaction is still a normal ECDSA transaction today. Closing this needs protocol-level work (native AA: **RIP-7560 / EIP-7701**-style directions). Until then, there's a residual ECDSA dependency in the pipeline.
- **The EIP-7702 caveat.** EIP-7702 lets an existing EOA *delegate* to smart-wallet code, adding PQ-AA behavior — but the **original ECDSA key still works** for signing. So delegation adds a PQ path without removing the quantum-vulnerable one. That's a risk, not a fix.

Keep these in mind: they're exactly the kind of "boundary" the project insists on stating out loud rather than papering over.

### Curated external resources

- **Antonio Sanso's article** *"The road to Post-Quantum Ethereum transactions is paved with Account Abstraction"* — the source of the project's framing. Read it in full; it's short and it's the "why."
- **EIP-7702** (`eips.ethereum.org/EIPS/eip-7702`) — skim the abstract and the security-considerations section for the "original key still valid" caveat.
