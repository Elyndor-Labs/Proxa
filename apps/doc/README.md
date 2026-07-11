# Proxa Documentation

Documentation for the Proxa monorepo apps layer.

| Doc | Description |
|-----|-------------|
| [WEB.md](./WEB.md) | Web app setup, architecture, and scripts |
| [CONTRACTS.md](./CONTRACTS.md) | On-chain program accounts and instructions |
| [ORACLE.md](./ORACLE.md) | TxLINE oracle integration and settlement flow |
| [DEPLOY.md](./DEPLOY.md) | Deploying the web app to production |
| [API.md](./API.md) | Backend API integration guide (endpoints TBD) |

## Quick start

```bash
cd apps/web
cp .env.example .env.local
bun install
bun dev
```

Build the SDK before running the web app:

```bash
cd packages/sdk && bun run build
```
