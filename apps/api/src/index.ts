import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "node:http";
import { proxaClient } from "./client";
import { cache } from "./middleware/cache";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { rateLimiter } from "./middleware/rateLimiter";
import { attachWebSocket } from "./middleware/websocket";
import { adminRouter } from "./routes/admin";
import { configRouter } from "./routes/config";
import { fixturesRouter } from "./routes/fixtures";
import { marketsRouter } from "./routes/markets";
import { notificationsRouter } from "./routes/notifications";
import { positionsRouter } from "./routes/positions";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

// attach shared client to every request
app.use((req, _res, next) => {
  (req as any).proxa = proxaClient;
  next();
});

app.use("/config", cache(30_000), configRouter);
app.use("/admin", adminRouter);
app.use("/fixtures", cache(60_000), fixturesRouter);
app.use("/markets", cache(10_000), marketsRouter);
app.use("/positions", cache(5_000), positionsRouter);
app.use("/notifications", notificationsRouter);

app.use(errorHandler);

attachWebSocket(server, proxaClient);

server.listen(PORT, () => {
  console.log(`Proxa API running on http://localhost:${PORT}`);
});
