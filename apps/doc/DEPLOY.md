# Deploying the Web App

## Prerequisites

- Node 20+ or Bun
- Built SDK: `cd packages/sdk && bun run build`
- Solana RPC endpoint (Helius recommended for production)

## Environment

Copy and configure:

```bash
cd apps/web
cp .env.example .env.local
```

| Variable | Production value |
|----------|------------------|
| `NEXT_PUBLIC_CLUSTER` | `mainnet-beta` |
| `NEXT_PUBLIC_SOLANA_RPC` | `https://mainnet.helius-rpc.com/?api-key=...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Your Sentry project DSN |
| `NEXT_PUBLIC_ERROR_WEBHOOK_URL` | Optional alerting webhook |

## Build

```bash
cd apps/web
bun install
bun run build
bun run start    # serves on :3000
```

## Vercel (recommended)

1. Set root directory to `apps/web`
2. Build command: `bun run build` (or `cd ../../packages/sdk && bun run build && cd ../../apps/web && bun run build`)
3. Output: Next.js default
4. Add all `NEXT_PUBLIC_*` env vars in project settings

## Pre-deploy checklist

- [ ] SDK built (`packages/sdk/dist` exists)
- [ ] RPC endpoint configured (not public mainnet default)
- [ ] Sentry DSN set
- [ ] `bun run test` passes
- [ ] `bun run test:e2e` passes
- [ ] `bun run lint` clean
- [ ] Cluster switcher tested on target network

## Cluster strategy

**Option A — Single deploy per network**
Set `NEXT_PUBLIC_CLUSTER` at build time; hide cluster switcher in production.

**Option B — Runtime switcher (current)**
Users pick Devnet/Mainnet in-app. Suitable for demos; use separate production deploy for mainnet-only.

## Monitoring

- **Sentry** — auto-initialized when `NEXT_PUBLIC_SENTRY_DSN` is set
- **Webhook** — `reportError()` POSTs to `NEXT_PUBLIC_ERROR_WEBHOOK_URL` on client errors
- **Solana Explorer** — tx toasts link to explorer with correct cluster param
