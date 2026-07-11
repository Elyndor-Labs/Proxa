import { ProxaClient } from "@proxa/sdk";
import { PublicKey } from "@solana/web3.js";
import { Router, Request, Response } from "express";

export const positionsRouter: Router = Router();

// GET /positions/:wallet — all positions for a wallet
positionsRouter.get("/:wallet", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const wallet = new PublicKey(req.params.wallet);
    const positions = await proxa.fetchPositions(wallet);
    const data = positions.map((p) => ({
      address: p.address.toBase58(),
      marketId: p.account.marketId.toString(),
      bucket: p.account.bucket,
      amount: p.account.amount.toString(),
    }));
    res.json({ data });
  } catch (err: any) {
    if (err.message?.includes("Invalid public key")) {
      res.status(400).json({ error: "Invalid wallet address" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /positions/:wallet/:marketId — positions for a wallet in a specific market
positionsRouter.get("/:wallet/:marketId", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const wallet = new PublicKey(req.params.wallet);
    const marketId = Number(req.params.marketId);
    const market = await proxa.fetchMarket(marketId);
    const results = [];
    for (let bucket = 0; bucket < market.numBuckets; bucket++) {
      try {
        const position = await proxa.fetchPosition(marketId, wallet, bucket);
        results.push({
          bucket,
          amount: position.amount.toString(),
        });
      } catch {
        // no position in this bucket
      }
    }
    res.json({ data: results });
  } catch (err: any) {
    if (err.message?.includes("Invalid public key")) {
      res.status(400).json({ error: "Invalid wallet address" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});
