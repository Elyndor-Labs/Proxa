# TxLINE Oracle

Proxa settles markets using signed Merkle proofs from the TxLINE sports oracle.

## Settlement flow

```
Match ends
    │
    ▼
Keeper fetches signed proof from TxLINE API
    │
    ▼
resolve_market instruction (on-chain)
    │
    ├── verify_proof(merkle_root, proof[], leaf)
    ├── validate TxLINE signature
    ├── map stat value → winning bucket
    └── mark market Resolved
    │
    ▼
Bettors call claim → USDC transferred to winners
```

## Proof format

```typescript
{
  merkle_root: Uint8Array,
  proof: Uint8Array[],
  leaf: Uint8Array,      // encoded stat outcome
  signature: Uint8Array  // TxLINE authority signature
}
```

The on-chain program verifies the signature against a known TxLINE authority pubkey before accepting the outcome.

## Keeper bot

The keeper (`apps/keeper`) watches for match-end events and submits settlement transactions:

1. Poll or webhook for fixture completion
2. Request proof from TxLINE REST API
3. Build and send `resolve_market` tx
4. Retry on failure with backoff

## Market settlement feed

The web app displays on-chain market status in the **Market Settlement Feed** on `/markets`. Resolved markets show `MERKLE_OK` when the proof has been verified on-chain.

## Fixture IDs

Markets reference external fixture IDs (e.g. `17271370`). These map to TxLINE's match feed. When backend endpoints are available, enriched fixture metadata (team names, kickoff times) will be served via the API layer — see [API.md](./API.md).

## Trust model

- **Oracle trust** — TxLINE signs outcomes; program verifies signature
- **Escrow trust** — USDC locked in program PDAs, not custodied by Proxa
- **Settlement trust** — Permissionless `claim` after resolution; anyone can verify proof on-chain
