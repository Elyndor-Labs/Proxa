# Proxa Web App

Next.js 16 frontend for Proxa — trustless parametric prop-bet settlement on Solana.

## Setup

```bash
cd apps/web
cp .env.example .env.local
bun install
```

Build the SDK first (from repo root):

```bash
cd packages/sdk && bun run build
```

## Development

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLUSTER` | `devnet` or `mainnet-beta` |
| `NEXT_PUBLIC_SOLANA_RPC` | Solana RPC URL (Helius recommended for production) |
| `NEXT_PUBLIC_SENTRY_DSN` | Optional Sentry DSN for error monitoring |
| `NEXT_PUBLIC_ERROR_WEBHOOK_URL` | Optional webhook for client error reports |

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun run build` | Production build |
| `bun run lint` | ESLint |
| `bun run start` | Start production server |
| `bun run test` | Run unit tests (Vitest) |
| `bun run test:watch` | Watch mode tests |
| `bun run test:e2e` | Playwright smoke tests |

## Architecture

- `(marketing)/` — landing, terms, privacy (no sidebar)
- `(app)/` — dashboard, markets, portfolio, etc. (app shell + bet slip)
- `@proxa/sdk` — path alias to `packages/sdk` (see `next.config.ts`)

## Docs

See [`apps/doc`](../doc/) for contracts, oracle, deployment, and API integration guides.

## Hydration notes

Browser extensions (e.g. Bitdefender) may inject attributes like `bis_skin_checked` into the DOM and trigger React hydration warnings in dev. This is not an app bug. Try an incognito window without extensions to verify.
