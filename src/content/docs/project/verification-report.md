---
title: Verification report
description: The exact FORS+C verifier claim, input domain, assumptions, provenance boundary, and Antonio sign-off checklist.
---

## Conclusion

The Lean development proves that the complete EVMYulLean execution of the
reviewed optimized-Yul transcription of `ForsVerifier.recover` refines the Lean
FORS+C recovery model on every ABI-representable input.

The exported theorem is:

```lean
phase4_forsRefines : ForsRefines
```

Expanded:

```lean
∀ raw digest, ForsAbiInput raw digest →
  evmRun raw digest = (recoverRaw? raw digest).getD 0
```

The proof covers the selector dispatcher, ABI guards, malformed-length
rejection, Hmsg, the forced-zero grinding guard, all 25 tree openings, roots
compression, address derivation, and the final return.

## Input domain

`ForsAbiInput` requires:

- a signature length representable by one EVM word;
- all modeled 16-byte chunks to fit their packed ABI representation without
  truncation;
- a digest representable by `bytes32`.

This restriction is necessary because the Lean model uses unbounded natural
numbers while EVM words are modulo `2^256`.

## Trust boundary

The final theorem depends on Lean core plus exactly two project axioms:

1. `evm_keccak_transcript`: Keccak on the proved canonical EVM bytes agrees
   with the model's opaque Keccak word.
2. `ffi_kec_size`: EVMYulLean's C-backed Keccak function returns 32 bytes.

Padding, word-codec round trips, the Keccak numeric bound, dispatcher routing,
and all execution traces are proved theorems.

## Provenance boundary

The proof executes `forsVerifierRuntime`, a reviewed transcription of:

```bash
forge inspect src/Verifiers/ForsVerifier.sol:ForsVerifier irOptimized
```

The Solidity source, optimized IR, and Lean runtime are fingerprinted by the
audit script. That detects drift and makes the review reproducible, but hashes
do not themselves prove semantic equality.

Therefore the precise claim is **functional correctness of the reviewed
optimized-IR transcription**, not yet a kernel-checked Solidity-source or
deployed-bytecode equivalence.

## Reproduce

From the `Solvency-Labs/NiceTry` repository:

```bash
./scripts/audit-fors-verifier.sh
```

This checks all three provenance hashes, confirms exactly two declared Bridge
axioms, builds all 1,172 Lean modules, and prints the final theorem's dependency
closure.

The canonical report, including fingerprints and the requested sign-off items,
is
[`Bridge/VERIFICATION_REPORT.md`](https://github.com/Solvency-Labs/NiceTry/blob/agent/phase4-integration/verity/NiceTry/Fors/Bridge/VERIFICATION_REPORT.md).

## Sign-off question

Antonio's decision is now narrow: is this acceptable with the two-item Keccak
boundary and reviewed optimized-IR transcription?

If the transcription boundary is not acceptable, the next milestone is to
derive or certify the EVMYulLean AST from pinned compiler output. The FORS
algorithm and full execution proof do not need to be repeated.
