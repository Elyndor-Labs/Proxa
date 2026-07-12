import { ProxaClient, statusLabel } from "@proxa/sdk";
import { Router, Request, Response } from "express";

export const marketsRouter: Router = Router();

// GET /markets?status=open|resolved|voided — all markets with optional filter
marketsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const statusFilter = req.query.status as string | undefined;
    const markets = await proxa.fetchAllMarkets();
    let data = markets.map((m) => ({
      marketId: m.account.marketId.toString(),
      fixtureId: m.account.fixtureId.toString(),
      statKey: m.account.statKey,
      status: statusLabel(m.account.status),
      numBuckets: m.account.numBuckets,
      winningBucket: m.account.winningBucket,
      winningValue: m.account.winningValue,
      totalPool: m.account.totalPool.toString(),
      bucketPools: m.account.bucketPools.map((b) => b.toString()),
      betsCloseTs: m.account.betsCloseTs.toString(),
      resolveAfterTs: m.account.resolveAfterTs.toString(),
      address: m.address.toBase58(),
    }));
    if (statusFilter) {
      data = data.filter((m) => m.status === statusFilter);
    }
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /markets/fixture/:fixtureId — all markets for a fixture
marketsRouter.get("/fixture/:fixtureId", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const fixtureId = Number(req.params.fixtureId);
    const markets = await proxa.fetchMarketsByFixture(fixtureId);
    const data = markets.map((m) => ({
      marketId: m.account.marketId.toString(),
      fixtureId: m.account.fixtureId.toString(),
      statKey: m.account.statKey,
      status: statusLabel(m.account.status),
      numBuckets: m.account.numBuckets,
      winningBucket: m.account.winningBucket,
      winningValue: m.account.winningValue,
      totalPool: m.account.totalPool.toString(),
      bucketPools: m.account.bucketPools.map((b) => b.toString()),
      address: m.address.toBase58(),
    }));
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /markets/:id — single market
marketsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const marketId = Number(req.params.id);
    const m = await proxa.fetchMarket(marketId);
    res.json({
      marketId: m.marketId.toString(),
      fixtureId: m.fixtureId.toString(),
      statKey: m.statKey,
      status: statusLabel(m.status),
      numBuckets: m.numBuckets,
      winningBucket: m.winningBucket,
      winningValue: m.winningValue,
      totalPool: m.totalPool.toString(),
      netPool: m.netPool.toString(),
      winningPool: m.winningPool.toString(),
      bucketPools: m.bucketPools.map((b) => b.toString()),
      feeBps: m.feeBps,
      feeCollected: m.feeCollected,
      betsCloseTs: m.betsCloseTs.toString(),
      resolveAfterTs: m.resolveAfterTs.toString(),
      resolveDeadlineTs: m.resolveDeadlineTs.toString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
