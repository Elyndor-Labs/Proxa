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

/** Subscribe to live market pool updates via the API WebSocket. */
export function subscribeToMarketUpdates(
  marketId: string,
  onUpdate: MarketUpdateHandler,
): () => void {
  const ws = new WebSocket(getApiWsUrl());
  let closed = false;

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "subscribe", marketId: Number(marketId) }));
  };

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data as string) as MarketUpdateMessage;
      if (msg.type === "market_update") {
        onUpdate(msg);
      }
    } catch {
      // Ignore malformed messages.
    }
  };

  return () => {
    if (closed) return;
    closed = true;
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}
