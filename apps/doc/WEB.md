# Web App

The Proxa frontend lives at `apps/web` — a Next.js 16 App Router application.

## Structure

```
apps/web/
├── src/app/
│   ├── (marketing)/     # Landing, terms, privacy
│   ├── (app)/           # Dashboard, markets, portfolio, etc.
│   └── design-system/
├── src/components/      # UI, layout, domain components
├── src/features/        # Route-level feature modules
├── src/hooks/           # React hooks (on-chain data, wallet)
├── src/lib/             # SDK client, Solana utils, formatting
├── e2e/                 # Playwright smoke tests
└── public/              # Static assets
```

## Route groups

| Group | Shell | Routes |
|-------|-------|--------|
| `(marketing)` | Header + footer | `/`, `/terms`, `/privacy` |
| `(app)` | Sidebar + header + bet slip | `/markets`, `/portfolio`, `/dashboard`, etc. |

## Data flow

1. **Wallet** — Phantom / Backpack / Solflare via `@solana/wallet-adapter-react`
2. **RPC** — `ConnectionProvider` endpoint from cluster switcher or env
3. **SDK** — `@proxa/sdk` `ProxaClient` for all on-chain reads and txs
4. **Cache** — TanStack Query with 30s stale time

No custom backend is required for core flows. Future REST endpoints can be wired via React Query in `src/lib/api/` (see [API.md](./API.md)).

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CLUSTER` | No | Default cluster (`devnet`) |
| `NEXT_PUBLIC_SOLANA_RPC` | No | RPC URL for default cluster |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry error monitoring |
| `NEXT_PUBLIC_ERROR_WEBHOOK_URL` | No | Custom error webhook |

## Scripts

```bash
bun dev           # Dev server on :3000
bun run build     # Production build
bun run test      # Vitest unit tests
bun run test:e2e  # Playwright smoke tests
bun run lint      # ESLint
```

## Cluster switcher

Users can toggle Devnet / Mainnet at runtime. Choice persists in `localStorage` under `proxa-cluster`. Switching clears the React Query cache and remounts the Solana connection.

## Bet slip

Multi-leg slip stores independent bets across markets. Each leg is placed as a separate on-chain transaction when the user confirms.

## Testing

- **Unit** — Vitest for utils and Zustand stores (`src/**/*.test.ts`)
- **E2E** — Playwright smoke tests in `e2e/` (landing, markets, governance, a11y)

## SDK alias

`@proxa/sdk` resolves to `packages/sdk` via `next.config.ts` Turbopack/webpack aliases. Build the SDK before `next build`.
