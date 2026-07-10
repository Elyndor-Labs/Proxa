import { ProxaClient, statusLabel } from "@proxa/sdk";
import { Router } from "express";

export const marketsRouter = Router();

// GET /markets — all markets
marketsRouter.get("/", async (req, res) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const markets = await proxa.fetchAllMarkets();
    const data = markets.map((m) => ({
      marketId: m.account.marketId.toString(),
      fixtureId: m.account.fixtureId.toString(),
      statKey: m.account.statKey,
      status: statusLabel(m.account.status),
      numBuckets: m.account.numBuckets,
      winningBucket: m.account.winningBucket,
      totalStake: m.account.totalStake.toString(),
      betsCloseTs: m.account.betsCloseTs.toString(),
      resolveAfterTs: m.account.resolveAfterTs.toString(),
      address: m.address.toBase58(),
    }));
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /markets/:id — single market
marketsRouter.get("/:id", async (req, res) => {
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
      totalStake: m.totalStake.toString(),
      bucketTotals: m.bucketTotals.map((b: any) => b.toString()),
      betsCloseTs: m.betsCloseTs.toString(),
      resolveAfterTs: m.resolveAfterTs.toString(),
      resolveDeadlineTs: m.resolveDeadlineTs.toString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /markets/fixture/:fixtureId — all markets for a fixture
marketsRouter.get("/fixture/:fixtureId", async (req, res) => {
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
      totalStake: m.account.totalStake.toString(),
      bucketTotals: m.account.bucketTotals.map((b: any) => b.toString()),
      address: m.address.toBase58(),
    }));
    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
