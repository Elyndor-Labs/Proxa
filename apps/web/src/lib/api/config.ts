import type { ConfigAccount } from "@proxa/sdk";
import { BN } from "@coral-xyz/anchor";
import type { ProxaClient } from "@proxa/sdk";
import { isApiEnabled } from "@/config/api";
import { apiParse } from "@/lib/api/client";
import { toPublicKey } from "@/lib/api/normalize";
import { apiConfigSchema } from "@/lib/api/schemas";
import type { ApiDefaults } from "@/lib/api/normalize";

let cachedDefaults: ApiDefaults | null = null;

/** GET /config — protocol config from the REST API. */
export async function fetchConfigFromApi(): Promise<ConfigAccount> {
  const data = await apiParse("/config", apiConfigSchema);

  cachedDefaults = { stakeMint: data.stakeMint };

  return {
    authority: toPublicKey(data.authority),
    stakeMint: toPublicKey(data.stakeMint),
    treasury: toPublicKey(data.treasury),
    feeBps: data.feeBps,
    marketCount: new BN(data.marketCount.toString()),
    bump: 0,
  };
}

/** Fetches protocol config from the API when configured, otherwise from chain. */
export async function fetchConfig(client: ProxaClient): Promise<ConfigAccount> {
  if (isApiEnabled()) {
    return fetchConfigFromApi();
  }
  return client.fetchConfig();
}

/** Cached stake mint from the last config fetch, used to fill market defaults. */
export async function getApiDefaults(): Promise<ApiDefaults> {
  if (cachedDefaults) return cachedDefaults;
  await fetchConfigFromApi();
  return cachedDefaults ?? {};
}
