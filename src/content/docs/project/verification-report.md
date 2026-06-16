---
title: Is the FORS verifier safe to use?
description: A plain-English production verdict, the exact proof claim, and the checks required before deployment.
---

## Short answer

**Yes, the pinned `ForsVerifier` is ready to be used as the FORS+C recovery
component, provided the deployment and integration checks below pass.**

The Lean proof establishes that the pinned optimized-Yul artifact parses to the
runtime Lean executes, and that this runtime returns exactly the signer address
defined by the FORS+C model. It covers the dispatcher, ABI decoding, both
rejection paths, all 25 trees, roots compression, and the final address.

The exact sentence we can defend is:

> If the deployed `ForsVerifier` bytecode exactly matches the pinned artifact,
> the wallet accepts only when the recovered address equals its current
> nonzero owner, and the signer follows the required key-rotation policy, then
> the verifier enforces the modeled FORS+C recovery algorithm correctly,
> assuming Ethereum Keccak behaves correctly.

This is a strong component-level result. It is not a proof that every wallet,
signer, deployment script, or operational process is automatically safe.

## The most important usage rule

`recover(signature, digest)` returns the address implied by the signature. It
is not a boolean validity check for a particular account.

A malformed signature with the correct length can recover a different nonzero
address. This is therefore unsafe:

```solidity
require(verifier.recover(signature, digest) != address(0));
```

The safe pattern is:

```solidity
address recovered = verifier.recover(signature, digest);
require(recovered != address(0) && recovered == currentOwner);
```

Both `SimpleAccount` and `FrameAccount` in the repository use the safe
recover-and-compare pattern.

## What has actually been proved

The reviewer-facing theorem is:

```lean
pinned_yul_runtime_matches_recover_model :
  parseDeployedRuntime pinnedForsOptimizedYul = .ok forsVerifierRuntime ∧
    ∀ raw digest, ForsAbiInput raw digest →
      evmRunWithRuntime forsVerifierRuntime raw digest =
        recoverOrZero raw digest
```

In plain English:

1. Lean parses the tracked optimized-Yul artifact to the exact runtime used by
   the proof.
2. For every ABI-representable signature and digest, executing that runtime
   returns the same address as the clean Lean FORS+C model.
3. Model rejection is represented as `address(0)`, matching the Solidity
   verifier's public behavior.

For the shortest file-by-file path, see the [review path](/solean-learn/project/review-path/).

This checks:

1. the correct function selector and dynamic `bytes` argument;
2. the exact 2,448-byte signature-length rule;
3. the offsets for `R`, `pkSeed`, counter, and all tree openings;
4. the Hmsg transcript and forced-zero grinding guard;
5. all 25 FORS tree reconstructions;
6. every left/right Merkle sibling decision;
7. every ADRS tree, level, and node index;
8. the 25-root compression transcript;
9. the final low-160-bit Ethereum address;
10. the zero-return behavior on both rejection paths.

Unlike tests, which sample particular signatures, the theorem covers every
input in the represented ABI domain.

## What kinds of bugs this rules out

For the pinned artifact, the proof rules out implementation mistakes such as:

- reading signature fields from the wrong calldata offsets;
- truncating or masking a field incorrectly;
- reversing Merkle children;
- climbing the wrong tree or wrong node;
- skipping, repeating, or miscounting a loop iteration;
- writing roots into the wrong memory slots;
- hashing the wrong bytes;
- returning the wrong address bits;
- bypassing the length or grinding rejection;
- routing the ABI dispatcher incorrectly.

These are the low-level assembly failures the verification project was meant
to eliminate.

## What remains a production condition

| Condition | Meaning |
|---|---|
| Exact deployed bytecode | The contract at the production address must exactly match the pinned compiled runtime. |
| Safe wallet comparison | The wallet must compare the recovered address with the expected current owner, not merely test for nonzero. |
| Correct digest | The signer and wallet must agree on exactly what is being signed. |
| Key rotation | FORS is few-time; keys must be burned or retired and ownership rotated according to policy. |
| Keccak | The proof assumes the standard Ethereum Keccak primitive behaves correctly. |
| Solidity compiler | The proof pins `solc 0.8.30`, but does not formally verify the compiler. |
| Pinned artifact import | Lean proves the tracked optimized-Yul text imports to the exact runtime used by the proof. |
| Wider system | Signer software, EntryPoint behavior, wallet authorization, deployment, and operations need their own review. |

## Release checklist

Do not call a deployment verified until all of these are green:

1. Run `./scripts/audit-fors-verifier.sh` on the release commit.
2. Run
   `./scripts/check-deployed-fors-verifier.sh RPC_URL VERIFIER_ADDRESS`.
3. Confirm the wallet's immutable verifier is that checked address.
4. Confirm every caller requires `recovered != address(0)` and
   `recovered == currentOwner`.
5. Confirm signer and wallet digest construction match.
6. Confirm the key burn, bounded-reuse, and owner-rotation policy.
7. Review and test the signer and wallet integration separately.

## Trust base

The final theorem has no `sorry` and depends on Lean core plus exactly two
project assumptions:

1. `evm_keccak_transcript`: Keccak of the proved EVM transcript bytes agrees
   with the model's opaque Keccak value.
2. `ffi_kec_size`: EVMYulLean's external Keccak result is 32 bytes.

The optimized-Yul parser/importer, ABI parsing, memory layout, rejection
behavior, loop iterations, Merkle ordering, root compression, and address
derivation are proved.

## Artifact identity

The release audit pins the Solidity source, optimized IR, Lean runtime, and
compiled deployed runtime. The pinned full runtime code hash is:

```text
0x41345cf3e55d977f792efdfee943698c695c544d01d28dc0a9412eb7e3fca113
```

The deployment checker requires a byte-for-byte match, including compiler
metadata. This prevents accidentally applying the proof to different code.

## Bottom line for Antonio

The FORS verifier computation itself is green.

It is reasonable to rely on it in production once the exact deployment has
been matched and the wallet, signer, digest, and key lifecycle satisfy the
release checklist. The honest remaining boundaries are pinned `solc`,
deployment identity, Keccak, and the surrounding wallet/signer operation.

The full technical report is
[`Bridge/VERIFICATION_REPORT.md`](https://github.com/Solvency-Labs/NiceTry/blob/main/verity/NiceTry/Fors/Bridge/VERIFICATION_REPORT.md).
