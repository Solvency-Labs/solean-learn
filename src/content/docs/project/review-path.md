---
title: Review path
description: The shortest path for reviewing the FORS verifier proof without already knowing the repo.
---

This is the page to read when someone asks: "What theorem should I review, and
where do I go next?"

## The claim

The pinned optimized-Yul artifact for `ForsVerifier.recover(bytes,bytes32)`
parses to the EVMYulLean runtime used in the proof, and executing that runtime
returns the same address as the clean FORS+C recovery model for every
ABI-representable signature and digest.

The reviewer-facing theorem is:

```lean
NiceTry.Fors.Bridge.pinned_yul_runtime_matches_recover_model :
  parseDeployedRuntime pinnedForsOptimizedYul = .ok forsVerifierRuntime ∧
    ∀ raw digest, ForsAbiInput raw digest →
      evmRunWithRuntime forsVerifierRuntime raw digest =
        recoverOrZero raw digest
```

`recoverOrZero` is only a name for the contract's public convention: when the
model rejects, the verifier returns `address(0)`.

Read the theorem in
[`ReviewSurface.lean`](https://github.com/Solvency-Labs/NiceTry/blob/main/verity/NiceTry/Fors/Bridge/ReviewSurface.lean).
Run the check with
[`Audit.lean`](https://github.com/Solvency-Labs/NiceTry/blob/main/verity/NiceTry/Fors/Bridge/Audit.lean).

## The path

1. **Clean FORS+C model.** The model defines the signature layout, the forced-zero
   rule, the 25 tree openings, root compression, and address derivation. Start
   with `Types.lean`, `Hash.lean`, `Model.lean`, `Spec.lean`, and
   `Proofs/Basic.lean`.

2. **Pinned compiler artifact.** `ForsVerifier.sol` is compiled with pinned
   settings. The optimized Yul is tracked in the repo. Lean's parser proves that
   this tracked text imports to exactly `forsVerifierRuntime`.

3. **EVMYulLean execution.** EVMYulLean executes `forsVerifierRuntime` on ABI
   calldata for `recover(bytes,bytes32)`. The proof checks the selector, calldata
   reads, rejection paths, all 25 tree openings, root compression, and returned
   address.

4. **Final comparison.** The runtime's returned address is proved equal to the
   clean model's `recoverOrZero` result on every ABI-representable input.

## The easy-to-mix-up part

There are two verifier-shaped things in the repo.

The **real verifier** is the one we deploy:

- `ForsVerifier.sol`
- the pinned optimized Yul produced from it
- `forsVerifierRuntime`, the runtime Lean executes

The **helper verifier** is generated through Verity. It was useful while building
and cross-checking the proof, but it is not the deployed contract and it is not
the runtime used by the final theorem.

The helper verifier has its own checklist. Nine of eleven items are proved. The
remaining two are about proving that the helper verifier's big 25-tree loop
writes roots into memory correctly. We already proved that loop for the real
verifier, so proving it again for the helper verifier would be duplicate work on
code we do not deploy.

So the review rule is simple:

> Review `pinned_yul_runtime_matches_recover_model` for the real verifier. Treat
> the Verity-generated helper verifier as useful background, not as part of the
> final deployed-runtime claim.

## What remains outside the proof

The theorem covers `ForsVerifier.recover`, not the whole production system.

A deployment is in scope only after:

1. deployed bytecode matches the pinned compiler output;
2. callers compare `recovered != address(0)` and `recovered == currentOwner`;
3. signer and wallet agree on the digest;
4. the FORS few-time key is rotated and retired according to policy.

The proof also does not prove Keccak itself, FORS unforgeability, signer
correctness, wallet correctness, Solidity compiler correctness, or arbitrary
deployed-bytecode identity.

## How to reproduce

From the NiceTry repo:

```bash
./scripts/audit-fors-verifier.sh
```

Or from `NiceTry/verity`:

```bash
lake build NiceTry
lake env lean NiceTry/Fors/Bridge/Audit.lean
```

The expected project assumptions under the review theorem are exactly:

- `evm_keccak_transcript`: EVM Keccak over the proved transcript bytes agrees
  with the model's opaque Keccak value.
- `ffi_kec_size`: EVMYulLean's external Keccak function returns 32 bytes.
