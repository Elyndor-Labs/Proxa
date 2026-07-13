import { ProxaClient, statusLabel } from "@proxa/sdk";
import { IncomingMessage, Server } from "node:http";
import { WebSocket, WebSocketServer } from "ws";

interface SubscribeMessage {
  type: "subscribe";
  marketId: number;
}

export function attachWebSocket(server: Server, proxa: ProxaClient): void {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws: WebSocket, _req: IncomingMessage) => {
    console.log("ws client connected");
    const intervals: NodeJS.Timeout[] = [];

    ws.on("message", (raw) => {
      try {
        const msg: SubscribeMessage = JSON.parse(raw.toString());

        if (msg.type === "subscribe" && msg.marketId !== undefined) {
          console.log(`ws subscribing to market ${msg.marketId}`);

          // poll every 5s and push updates
          const interval = setInterval(async () => {
            try {
              const m = await proxa.fetchMarket(msg.marketId);
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: "market_update",
                  marketId: msg.marketId,
                  status: statusLabel(m.status),
                  totalPool: m.totalPool.toString(),
                  bucketPools: m.bucketPools.map((b) => b.toString()),
                  winningBucket: m.winningBucket,
                  winningValue: m.winningValue,
                }));
              }
            } catch (err: any) {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "error", message: err.message }));
              }
            }
          }, 5_000);

          intervals.push(interval);
        }
      } catch {
        ws.send(JSON.stringify({ type: "error", message: "invalid message" }));
      }
    });

    ws.on("close", () => {
      console.log("ws client disconnected");
      intervals.forEach(clearInterval);
    });
  });

  console.log("WebSocket server attached at /ws");
}
