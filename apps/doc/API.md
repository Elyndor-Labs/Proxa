# Backend API Integration

The web app reads markets and positions from the Proxa REST API when `NEXT_PUBLIC_API_URL` is set. Otherwise it falls back to direct on-chain reads via `@proxa/sdk`.

## Endpoints

| Feature | Endpoint | Web module |
|---------|----------|------------|
| Single market | `GET /markets/:id` | `src/lib/api/markets.ts` |
| Fixture markets | `GET /markets/fixture/:fixtureId` | `src/lib/api/markets.ts` |
| Wallet positions | `GET /positions/:wallet` | `src/lib/api/positions.ts` |

## Hooks

| Hook | API endpoint | Fallback |
|------|--------------|----------|
| `useMarket` | `GET /markets/:id` | `ProxaClient.fetchMarket` |
| `useFixtureMarkets` | `GET /markets/fixture/:fixtureId` | `ProxaClient.fetchMarketsByFixture` |
| `usePositions` | `GET /positions/:wallet` | `ProxaClient.fetchPositions` |

Live pool updates on the market detail page still use on-chain subscriptions when `subscribe: true`.

## Response shapes

### `GET /markets/:id`

Returns either a market record or a bare account:

```json
{
  "address": "<market-pda>",
  "account": {
    "marketId": "1",
    "creator": "<pubkey>",
    "fixtureId": "17271370",
    "statKey": 1001,
    "numBuckets": 2,
    "betsCloseTs": "1710000000",
    "resolveAfterTs": "1710003600",
    "resolveDeadlineTs": "1710086400",
    "feeBps": 200,
    "stakeMint": "<pubkey>",
    "vault": "<pubkey>",
    "totalPool": "5000000",
    "bucketPools": ["3000000", "2000000"],
    "status": "open",
    "winningBucket": 0,
    "winningValue": 0,
    "netPool": "0",
    "winningPool": "0",
    "feeCollected": false,
    "bump": 255,
    "vaultBump": 254
  }
}
```

`status` may also be `{ "open": {} }`, `{ "resolved": {} }`, or `{ "voided": {} }`.

### `GET /markets/fixture/:fixtureId`

Returns an array of market records (same shape as above).

### `GET /positions/:wallet`

Returns an array of position records:

```json
[
  {
    "address": "<position-pda>",
    "account": {
      "marketId": "1",
      "bettor": "<wallet-pubkey>",
      "bucket": 0,
      "amount": "1000000",
      "bump": 255
    }
  }
]
```

Numeric fields (`marketId`, `fixtureId`, pool amounts, timestamps) are accepted as strings or numbers. Pubkeys are base58 strings.

## Environment

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://api.proxa.sol
```

When unset, the app uses on-chain data only.

## Client module

```typescript
// src/lib/api/client.ts
const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ... });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}
```

Deserialization to SDK types (`MarketAccount`, `PositionAccount`) lives in `src/lib/api/deserialize.ts`.

## Auth

Core flows are wallet-based (no sessions). If backend endpoints require auth later, options:

1. **Wallet signature** — sign a nonce, send as `Authorization` header
2. **JWT** — issued after wallet verification endpoint

Auth integration will be added to `src/lib/api/client.ts` when specified.
