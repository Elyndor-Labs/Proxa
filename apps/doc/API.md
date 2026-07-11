# Backend API Integration

> **Status:** Endpoints will be provided later. This doc describes how the web app will integrate once APIs are available.

## Planned integration points

| Feature | Endpoint (TBD) | Web hook location |
|---------|----------------|-------------------|
| Fixture metadata | `GET /fixtures/:id` | `src/lib/api/fixtures.ts` |
| Market enrichment | `GET /markets/:id/meta` | `src/lib/api/markets.ts` |
| Activity feed | `GET /feed` | Oracle feed table |
| Search index | `GET /search?q=` | Markets search |
| Notifications | `GET /notifications` | Dashboard |
| Leaderboard cache | `GET /leaderboard` | Leaderboard page |

## Integration pattern

Use TanStack Query with a thin API client:

```typescript
// src/lib/api/client.ts (to be created)
const BASE = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}
```

```typescript
// src/hooks/use-fixture-meta.ts (example)
export function useFixtureMeta(fixtureId: string) {
  return useQuery({
    queryKey: ["fixture-meta", fixtureId],
    queryFn: () => api<FixtureMeta>(`/fixtures/${fixtureId}`),
    enabled: Boolean(process.env.NEXT_PUBLIC_API_URL),
  });
}
```

## Environment

```bash
# Add when backend is ready
NEXT_PUBLIC_API_URL=https://api.proxa.sol
```

## Fallback behavior

Until `NEXT_PUBLIC_API_URL` is set, the app uses on-chain data only:

- Market titles derived from stat + fixture ID
- Leaderboard computed from position accounts
- No team logos or schedules

Components should gracefully degrade when API data is unavailable.

## Auth

Core flows are wallet-based (no sessions). If backend endpoints require auth later, options:

1. **Wallet signature** — sign a nonce, send as `Authorization` header
2. **JWT** — issued after wallet verification endpoint

Auth integration will be added to `src/lib/api/client.ts` when specified.

## Next steps

1. Define OpenAPI spec for backend endpoints
2. Set `NEXT_PUBLIC_API_URL` in `.env.local`
3. Create `src/lib/api/` client module
4. Add hooks per feature with on-chain fallback
