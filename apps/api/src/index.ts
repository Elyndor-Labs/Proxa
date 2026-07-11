import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createClient } from "./client";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { rateLimiter } from "./middleware/rateLimiter";
import { marketsRouter } from "./routes/markets";
import { positionsRouter } from "./routes/positions";

dotenv.config();

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());
app.use(logger);
app.use(rateLimiter);

// health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", ts: Date.now() });
});

// attach SDK client to every request
app.use((req, _res, next) => {
  (req as any).proxa = createClient();
  next();
});

app.use("/markets", marketsRouter);
app.use("/positions", positionsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Proxa API running on http://localhost:${PORT}`);
});
