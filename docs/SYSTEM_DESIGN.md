# Proxa — System Design

## Overview

Proxa is a trustless parametric prop-bet settlement engine. Users lock USDC into on-chain escrow PDAs against specific match conditions. A keeper triggers settlement post-match via CPI to TxLINE's oracle, which returns a signed Merkle proof of the outcome. Winners are paid out automatically with no human intermediary.

---

## 1. Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                          USER (Browser)                              │
│   - Connects wallet (Phantom / Backpack)                             │
│   - Browses props, selects outcome, inputs USDC amount               │
│   - Signs transaction → places bet                                   │
└──────────────────────┬───────────────────────────────────────────────┘
                       │  signed tx
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     SOLANA BLOCKCHAIN                                │
│                                                                      │
│  ┌─────────────────────┐     ┌──────────────────────────────────┐   │
│  │   Prop Registry PDA  │     │        Escrow PDA (per prop)     │   │
│  │                     │     │                                  │   │
│  │  - prop_id          │     │  - locked USDC (SPL token acct)  │   │
│  │  - match_id         │     │  - bet_positions[]               │   │
│  │  - condition        │     │    { user, side, amount }        │   │
│  │  - status           │     │  - total_long / total_short      │   │
│  │  - oracle_feed_id   │     │  - status: Open|Locked|Settled   │   │
│  │  - settlement_ts    │     │                                  │   │
│  └─────────────────────┘     └──────────┬───────────────────────┘   │
│                                         │                            │
│  ┌──────────────────────────────────────▼───────────────────────┐   │
│  │                  Settlement Program                           │   │
│  │                                                              │   │
│  │  verify_proof(merkle_root, proof[], leaf)                    │   │
│  │  → validates TxLINE signature                                │   │
│  │  → resolves condition (true/false)                           │   │
│  │  → calculates payout shares                                  │   │
│  │  → transfers USDC from escrow → winners                      │   │
│  │  → emits SettlementEvent                                     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │ CPI call with proof
                                 ▲
┌────────────────────────────────┴─────────────────────────────────────┐
│                        KEEPER BOT (offchain)                         │
│                                                                      │
│  1. Watches for match end events (Helius webhooks / polling)         │
│  2. Fetches signed Merkle proof from TxLINE API                      │
│  3. Constructs + submits settlement tx to Solana                     │
│  4. Retries on failure, emits logs                                   │
└──────────────────────────────────────────────────────────────────────┘
                                 │ REST/WS
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        TxLINE ORACLE                                 │
│                                                                      │
│  - Official sports data feed                                         │
│  - Returns signed Merkle proof of match stats                        │
│  - Proof format: { merkle_root, proof[], leaf, signature }           │
│  - Program verifies signature against TxLINE's known pubkey          │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Entities

### Prop
A user-defined or curated parametric condition on a match stat.

```
Prop {
  prop_id:        u64
  match_id:       String        // e.g. "UEFA_2026_QF_BRA_ARG"
  description:    String        // "Brazil scores 2+ goals"
  condition_type: ConditionType // Goals | Corners | Cards | Shots | Custom
  operator:       Operator      // Over | Under | Exactly
  threshold:      f64           // 2.0
  side_a_label:   String        // "Yes"
  side_b_label:   String        // "No"
  close_ts:       i64           // Betting closes at kickoff
  settlement_ts:  i64           // Expected match end
  oracle_feed_id: Pubkey        // TxLINE feed address
  status:         PropStatus    // Draft | Open | Locked | Settled | Voided
  creator:        Pubkey
  protocol_fee:   u16           // bps, e.g. 200 = 2%
}
```

### Bet Position
```
BetPosition {
  user:      Pubkey
  prop_id:   u64
  side:      Side      // SideA | SideB
  amount:    u64       // USDC (6 decimals)
  placed_ts: i64
  claimed:   bool
}
```

### Escrow PDA
One per prop. Holds all USDC until settlement.
```
Seeds: ["escrow", prop_id.to_le_bytes()]
Holds: SPL USDC token account
```

---

## 3. Program Instructions

### `create_prop`
- Authority (admin or user) defines condition
- Creates PropRegistry PDA + Escrow PDA
- Status → Open

### `place_bet`
- User picks SideA or SideB, inputs USDC amount
- Transfers USDC → Escrow PDA
- Appends BetPosition to escrow account
- Enforces `close_ts` deadline

### `lock_prop`
- Called at kickoff (keeper or permissionless)
- Status Open → Locked; no new bets accepted

### `settle_prop`
- Called by keeper post-match
- Accepts `{ merkle_root, proof[], leaf, txline_sig }`
- Verifies TxLINE signature on-chain
- Evaluates condition: true (SideA wins) or false (SideB wins)
- Calculates each winner's proportional share of the losing pool
- Distributes USDC: winners get principal + winnings, losers get nothing
- Deducts protocol fee → treasury PDA
- Status → Settled

### `claim_payout`
- Winner calls after settlement
- Program checks their BetPosition, marks claimed
- Transfers their share from escrow → user wallet

### `void_prop`
- Emergency: admin can void (e.g. match cancelled)
- All bettors can reclaim their stake

---

## 4. Payout Mechanism

Proxa uses a **parimutuel** model within each prop:

```
total_pool    = total_side_a + total_side_b
winning_pool  = total amount on winning side
losing_pool   = total amount on losing side
fee           = losing_pool * protocol_fee_bps / 10000
distributable = losing_pool - fee

winner_payout(user) = user.stake + (user.stake / winning_pool) * distributable
```

This means odds are determined by market participation, similar to a totalisator. No house book needed.

---

## 5. Oracle & Proof Verification

TxLINE publishes match stats as a Merkle tree. Each stat is a leaf:
```
leaf = hash(match_id || stat_type || value || timestamp)
```

The keeper fetches:
```json
{
  "match_id": "UEFA_2026_QF_BRA_ARG",
  "stat": "goals_brazil",
  "value": 3,
  "merkle_root": "0xabc...",
  "proof": ["0x111...", "0x222..."],
  "signature": "0xdef..."   // ed25519 over merkle_root
}
```

The on-chain Settlement Program:
1. Recomputes leaf from `(match_id, stat, value)`
2. Walks the Merkle proof to verify leaf → root
3. Verifies TxLINE's ed25519 signature over the root using TxLINE's known on-chain pubkey
4. Evaluates `value operator threshold` → boolean
5. Proceeds to payout

TxLINE's public key is stored in a Config PDA (updatable only by multisig).

---

## 6. Keeper Bot

The keeper is a Node.js daemon responsible for:

1. **Monitoring** open props via the Proxa SDK
2. **Locking** props at `close_ts` (permissionless, but keeper does it reliably)
3. **Polling TxLINE** for match results after `settlement_ts`
4. **Submitting settlement tx** with Merkle proof
5. **Retry logic** with exponential backoff
6. **Alerting** on failures (Discord webhook / PagerDuty)

Keeper is incentivized: earns a small `keeper_fee` from the protocol fee on each successful settlement.

---

## 7. Frontend (Web App)

**Pages:**
- `/` — Featured live & upcoming props
- `/match/[id]` — All props for a match
- `/prop/[id]` — Prop detail, bet placement, live odds
- `/portfolio` — User's active bets, claimable winnings
- `/create` — Create a custom prop (power users)

**Key Components:**
- `PropCard` — Odds display, SideA/SideB buttons
- `BetSlip` — Collects amount, confirms tx, shows expected payout
- `LiveOddsBar` — Real-time pool ratio (polling or WS subscription)
- `SettlementBadge` — Shows "Awaiting proof", "Settled: Brazil Won", "Void"
- `ClaimButton` — One-click claim for winners post-settlement

---

## 8. Security Considerations

| Risk | Mitigation |
|---|---|
| Oracle manipulation | TxLINE signature verified on-chain; pubkey in multisig-controlled Config PDA |
| Front-running bets at close | `close_ts` enforced on-chain by slot timestamp |
| Escrow drain | Escrow PDA is program-owned; only Settlement Program can move funds |
| Prop creation spam | Creator deposits anti-spam bond; refunded if prop settles cleanly |
| Keeper fails to settle | Permissionless settlement — anyone can submit valid proof after `settlement_ts` |
| Math overflow | All arithmetic uses checked math; amounts in u64 USDC lamports |
| Upgrade authority | Programs should be frozen post-audit or gated behind multisig |

---

## 9. Data Flow Summary

```
User bets     → place_bet ix → USDC locked in Escrow PDA
Kickoff       → lock_prop ix → no new bets
Match ends    → TxLINE publishes Merkle proof
Keeper fetches proof → submits settle_prop ix
Program verifies proof + sig → resolves outcome
Winners call claim_payout → receive USDC
```

---

## 10. Milestones

| Milestone | Scope |
|---|---|
| M1 — Core Contracts | PropRegistry, Escrow, Settlement (devnet) |
| M2 — TxLINE Integration | Keeper bot, proof verification, devnet E2E test |
| M3 — Web App Alpha | Prop browsing, bet placement, portfolio |
| M4 — Parimutuel Math | Payout calculation, protocol fee |
| M5 — Audit + Mainnet | Security audit, mainnet deploy |
