# Proxa

> Trustless parametric prop-bet settlement engine on Solana.

Users create and wager USDC on custom parametric props (e.g. "Brazil scores 2+ goals", "Over 4.5 cards", "Team A corners + Team B corners > 10.5"). Funds lock in on-chain escrow PDAs. When a match ends, a keeper triggers CPI to TxLINE's oracle — winners receive automatic payouts verified by Merkle proof. No middleman. No trusted server.

---

## Monorepo Structure

```
proxa/
├── packages/
│   ├── programs/          # Solana Anchor smart contracts
│   └── sdk/               # TypeScript SDK for interacting with programs
├── apps/
│   ├── web/               # Next.js sportsbook-style frontend
│   └── keeper/            # Offchain keeper bot (triggers settlement)
├── docs/                  # Architecture & design docs
└── scripts/               # Deploy, seed, and admin scripts
```

## Packages

| Package | Description |
|---|---|
| `@proxa/programs` | Anchor programs — escrow, prop registry, settlement |
| `@proxa/sdk` | TypeScript client SDK |
| `apps/web` | Next.js + Tailwind sportsbook UI |
| `apps/keeper` | Node.js keeper daemon |

## Quick Start

```bash
# Install dependencies
pnpm install

# Build programs
cd packages/programs && anchor build

# Run local validator + deploy
anchor localnet

# Start web app
cd apps/web && pnpm dev

# Start keeper (separate terminal)
cd apps/keeper && pnpm dev
```

## Docs

- [System Design](./docs/SYSTEM_DESIGN.md)
- [Smart Contract Architecture](./docs/CONTRACTS.md)
- [TxLINE Oracle Integration](./docs/ORACLE.md)
- [Contributing](./docs/CONTRIBUTING.md)

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production — protected, requires 2 reviews |
| `dev` | Integration branch — requires 1 review |
| `feat/*` | Feature branches — open PRs to `dev` |
| `fix/*` | Bug fix branches |
| `chore/*` | Tooling, deps, config |

## Tech Stack

- **Blockchain**: Solana (Anchor framework)
- **Oracle**: TxLINE (sports data feed + Merkle proofs)
- **Stablecoin**: USDC (SPL Token)
- **Frontend**: Next.js 14, Tailwind CSS, Shadcn/ui
- **Wallet**: Wallet Adapter (Phantom, Backpack, etc.)
- **Keeper**: Node.js daemon (Helius webhooks / polling)
- **Monorepo**: pnpm workspaces + Turborepo
