import { ProxaClient } from "@proxa/sdk";
import { Router, Request, Response } from "express";

export const configRouter: Router = Router();

// GET /config — protocol config
configRouter.get("/", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const cfg = await proxa.fetchConfig();
    res.json({
      authority: cfg.authority.toBase58(),
      stakeMint: cfg.stakeMint.toBase58(),
      treasury: cfg.treasury.toBase58(),
      feeBps: cfg.feeBps,
      marketCount: cfg.marketCount.toString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
