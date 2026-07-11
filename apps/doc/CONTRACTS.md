# On-Chain Contracts

Proxa's settlement logic runs on Solana via Anchor programs in `packages/programs`.

## Core accounts

### Config (global)

| Field | Type | Description |
|-------|------|-------------|
| `authority` | `Pubkey` | Protocol admin — required to create markets |
| `stake_mint` | `Pubkey` | SPL token mint for stakes (USDC on devnet) |
| `treasury` | `Pubkey` | Fee recipient |
| `fee_bps` | `u16` | Protocol fee in basis points |
| `market_count` | `u64` | Total markets created |

### Market

| Field | Type | Description |
|-------|------|-------------|
| `market_id` | `u64` | Unique market identifier |
| `fixture_id` | `u64` | External match/fixture reference |
| `stat` | `u8` | Stat type (goals, assists, etc.) |
| `period` | `u8` | Match period |
| `num_buckets` | `u8` | Number of outcome buckets |
| `status` | enum | `Open`, `Resolved`, `Voided` |
| `bucket_pools` | `u64[]` | USDC locked per bucket |

### Position

| Field | Type | Description |
|-------|------|-------------|
| `market_id` | `u64` | Parent market |
| `bettor` | `Pubkey` | Wallet that placed the bet |
| `bucket` | `u8` | Selected outcome bucket |
| `amount` | `u64` | Stake in base units |

## Instructions

| Instruction | Signer | Description |
|-------------|--------|-------------|
| `create_market` | Authority | Launch a new parametric market |
| `place_bet` | Bettor | Lock USDC into a bucket |
| `resolve_market` | Keeper | Settle via oracle proof (keeper bot) |
| `claim` | Bettor | Withdraw winnings from resolved market |

## PDA seeds

Markets and positions are derived PDAs — see `packages/sdk` for seed helpers (`marketPda`, `positionPda`, etc.).

## SDK usage

```typescript
import { ProxaClient, DEVNET } from "@proxa/sdk";

const client = new ProxaClient(provider, { network: DEVNET });
const markets = await client.fetchAllMarkets();
const ix = await client.placeBetIx({ /* ... */ });
```

## Networks

| Network | Status |
|---------|--------|
| Devnet | Fully configured |
| Mainnet | Program deployed; TxL mint placeholder until wired |

See [ORACLE.md](./ORACLE.md) for settlement verification.
