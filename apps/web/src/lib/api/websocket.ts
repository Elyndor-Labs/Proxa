import { getApiWsUrl } from "@/config/api";

export interface MarketUpdateMessage {
  type: "market_update";
  marketId: number;
  status: "open" | "resolved" | "voided";
  totalPool: string;
  bucketPools: string[];
  winningBucket: number;
  winningValue: number;
}

type MarketUpdateHandler = (update: MarketUpdateMessage) => void;

/**
 * Subscribe to live market pool updates via the API WebSocket.
 * Returns an unsubscribe fn. Connection failures are silent — callers should
 * keep HTTP polling as a fallback when WS is unavailable (e.g. some hosts).
 */
export function subscribeToMarketUpdates(
  marketId: string,
  onUpdate: MarketUpdateHandler,
): () => void {
  let closed = false;
  let ws: WebSocket | null = null;

  try {
    ws = new WebSocket(getApiWsUrl());
  } catch {
    return () => {
      closed = true;
    };
  }

  ws.onopen = () => {
    if (closed || !ws) return;
    ws.send(JSON.stringify({ type: "subscribe", marketId: Number(marketId) }));
  };

  ws.onmessage = (event) => {
    if (closed) return;
    try {
      const msg = JSON.parse(String(event.data)) as MarketUpdateMessage;
      if (msg.type === "market_update") onUpdate(msg);
    } catch {
      // Ignore malformed messages.
    }
  };

  ws.onerror = () => {
    // Host may not expose /ws (proxies, cold starts). Polling covers updates.
  };

  return () => {
    if (closed) return;
    closed = true;
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
      ws.close();
    }
    ws = null;
  };
}
