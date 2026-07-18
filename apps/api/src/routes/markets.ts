import { ProxaClient, statusLabel } from "@proxa/sdk";
import { Router, Request, Response } from "express";
import { prisma } from "../db";

export const marketsRouter: Router = Router();

function isLegacyMarketDecodeError(error: unknown): boolean {
  return error instanceof RangeError && error.message.includes("offset");
}

function toMarketResponse(m: Awaited<ReturnType<ProxaClient["fetchAllMarkets"]>>[number]) {
  return {
    marketId: m.account.marketId.toString(),
    fixtureId: m.account.fixtureId.toString(),
    statKey: m.account.statKey,
    status: statusLabel(m.account.status),
    numBuckets: m.account.numBuckets,
    bucketBounds: m.account.bucketBounds,
    winningBucket: m.account.winningBucket,
    winningValue: m.account.winningValue,
    totalPool: m.account.totalPool.toString(),
    bucketPools: m.account.bucketPools.map((b) => b.toString()),
    betsCloseTs: m.account.betsCloseTs.toString(),
    resolveAfterTs: m.account.resolveAfterTs.toString(),
    resolveDeadlineTs: m.account.resolveDeadlineTs.toString(),
    netPool: m.account.netPool.toString(),
    winningPool: m.account.winningPool.toString(),
    feeBps: m.account.feeBps,
    feeCollected: m.account.feeCollected,
    address: m.address.toBase58(),
  };
}

async function publishedMarketIds(where?: { fixtureId?: number }): Promise<Set<string>> {
  const rows = await prisma.market.findMany({
    where,
    select: { id: true },
  });
  return new Set(rows.map((row: { id: number }) => String(row.id)));
}

// GET /markets?status=open|resolved|voided - published on-chain markets only.
marketsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const statusFilter = req.query.status as string | undefined;
    let markets: Awaited<ReturnType<ProxaClient["fetchAllMarkets"]>>;
    try {
      markets = await proxa.fetchAllMarkets();
    } catch (err) {
      if (!isLegacyMarketDecodeError(err)) throw err;
      console.warn("Unable to decode legacy market accounts; returning an empty market list.");
      res.json({ data: [] });
      return;
    }

    let data = markets.map(toMarketResponse);

    if (statusFilter) {
      data = data.filter((m) => m.status === statusFilter);
    }

    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /markets/fixture/:fixtureId - published markets for one fixture.
marketsRouter.get("/fixture/:fixtureId", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const fixtureId = Number(req.params.fixtureId);
    let markets: Awaited<ReturnType<ProxaClient["fetchMarketsByFixture"]>>;
    try {
      markets = await proxa.fetchMarketsByFixture(fixtureId);
    } catch (err) {
      if (!isLegacyMarketDecodeError(err)) throw err;
      console.warn("Unable to decode legacy fixture market accounts; returning an empty market list.");
      res.json({ data: [] });
      return;
    }
    const data = markets.map(toMarketResponse);

    res.json({ data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /markets/:id - single published market.
marketsRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const proxa: ProxaClient = (req as any).proxa;
    const marketId = Number(req.params.id);
    let m: Awaited<ReturnType<ProxaClient["fetchMarket"]>>;
    try {
      m = await proxa.fetchMarket(marketId);
    } catch (err) {
      if (!isLegacyMarketDecodeError(err)) throw err;
      res.status(410).json({
        error:
          "This local market was created with an older account layout. Recreate it after the bucket bounds upgrade.",
      });
      return;
    }
    res.json({
      marketId: m.marketId.toString(),
      fixtureId: m.fixtureId.toString(),
      statKey: m.statKey,
      status: statusLabel(m.status),
      numBuckets: m.numBuckets,
      bucketBounds: m.bucketBounds,
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
