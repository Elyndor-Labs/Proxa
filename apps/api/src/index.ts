import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createClient } from "./client";
import { cache } from "./middleware/cache";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { rateLimiter } from "./middleware/rateLimiter";
import { configRouter } from "./routes/config";
import { marketsRouter } from "./routes/markets";
import { positionsRouter } from "./routes/positions";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimiter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

app.use((req, _res, next) => {
  (req as any).proxa = createClient();
  next();
});

app.use("/config", cache(30_000), configRouter);
app.use("/markets", cache(10_000), marketsRouter);
app.use("/positions", cache(5_000), positionsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Proxa API running on http://localhost:${PORT}`);
});
