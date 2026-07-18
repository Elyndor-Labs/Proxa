import { ProxaClient, statusLabel } from "@proxa/sdk";
import { IncomingMessage, Server } from "node:http";
import { WebSocket, WebSocketServer } from "ws";

interface SubscribeMessage {
  type: "subscribe";
  marketId: number;
}

interface UnsubscribeMessage {
  type: "unsubscribe";
  marketId: number;
}

type ClientMessage = SubscribeMessage | UnsubscribeMessage;

const MAX_SUBSCRIPTIONS_PER_CONNECTION = 25;
const POLL_INTERVAL_MS = 5_000;

function sendJson(ws: WebSocket, payload: unknown): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function parseMarketId(value: unknown): number | null {
  const marketId = Number(value);
  return Number.isInteger(marketId) && marketId >= 0 ? marketId : null;
}

export function attachWebSocket(server: Server, proxa: ProxaClient): void {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    console.log("ws client connected");
    const subscriptions = new Map<number, NodeJS.Timeout>();

    const unsubscribe = (marketId: number) => {
      const interval = subscriptions.get(marketId);
      if (!interval) return;
      clearInterval(interval);
      subscriptions.delete(marketId);
      sendJson(ws, { type: "unsubscribed", marketId });
    };

    ws.on("message", (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as ClientMessage;
        const marketId = parseMarketId((msg as { marketId?: unknown }).marketId);
        if (marketId == null) {
          sendJson(ws, { type: "error", message: "invalid marketId" });
          return;
        }

        if (msg.type === "unsubscribe") {
          unsubscribe(marketId);
          return;
        }

        if (msg.type !== "subscribe") {
          sendJson(ws, { type: "error", message: "unsupported message type" });
          return;
        }

        if (subscriptions.has(marketId)) {
          sendJson(ws, { type: "subscribed", marketId, duplicate: true });
          return;
        }

        if (subscriptions.size >= MAX_SUBSCRIPTIONS_PER_CONNECTION) {
          sendJson(ws, {
            type: "error",
            message: `subscription limit reached (${MAX_SUBSCRIPTIONS_PER_CONNECTION})`,
          });
          return;
        }

        console.log(`ws subscribing to market ${marketId}`);

        const interval = setInterval(async () => {
          try {
            const m = await proxa.fetchMarket(marketId);
            sendJson(ws, {
              type: "market_update",
              marketId,
              status: statusLabel(m.status),
              totalPool: m.totalPool.toString(),
              bucketPools: m.bucketPools.map((b) => b.toString()),
              winningBucket: m.winningBucket,
              winningValue: m.winningValue,
            });
          } catch {
            if (ws.readyState === WebSocket.OPEN) {
              sendJson(ws, {
                type: "error",
                marketId,
                message: "failed to load market update",
              });
            }
          }
        }, POLL_INTERVAL_MS);

        subscriptions.set(marketId, interval);
        sendJson(ws, { type: "subscribed", marketId });
      } catch {
        sendJson(ws, { type: "error", message: "invalid message" });
      }
    });

    ws.on("close", () => {
      console.log("ws client disconnected");
      subscriptions.forEach(clearInterval);
      subscriptions.clear();
    });
  });

  console.log("WebSocket server attached at /ws");
}
