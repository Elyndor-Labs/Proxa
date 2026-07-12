/** Client-side API configuration helpers. */

export const ONCHAIN_TX_DISABLED_MESSAGE =
  "On-chain transactions are disabled in API mode. Remove NEXT_PUBLIC_API_URL to trade on devnet.";

export function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return base.replace(/\/$/, "");
}

/** WebSocket URL derived from NEXT_PUBLIC_API_URL (https → wss). */
export function getApiWsUrl(): string {
  const base = getApiBaseUrl();
  if (base.startsWith("https://")) return `wss://${base.slice("https://".length)}/ws`;
  if (base.startsWith("http://")) return `ws://${base.slice("http://".length)}/ws`;
  return `${base}/ws`;
}

export function isApiEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}

/** True when the wallet can sign and submit Solana transactions. */
export function canSubmitOnChainTx(walletConnected: boolean): boolean {
  return walletConnected && !isApiEnabled();
}

/** Throws when on-chain transactions are not allowed. */
export function assertCanSubmitOnChainTx(walletConnected: boolean): void {
  if (!walletConnected) throw new Error("Wallet not connected");
  if (isApiEnabled()) throw new Error(ONCHAIN_TX_DISABLED_MESSAGE);
}

/** True when the app is running in mock-demo mode (landing CTA + API reads). */
export function isMockDemo(): boolean {
  return process.env.NEXT_PUBLIC_MOCK_DEMO === "true";
}

/** Bearer token sent to the Proxa REST API when configured. */
export function getApiAuthHeaders(): HeadersInit {
  const token = process.env.NEXT_PUBLIC_API_AUTH_TOKEN;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
