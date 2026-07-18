import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/adminAuth";
import { prisma } from "../db";
import {
  TxOddsService,
  toDateFromMs,
  txOddsGameStateToStatus,
} from "../services/txodds";
import { mapTxOddsSnapshotToStatKey } from "../services/statKeyMapping";

export const adminRouter: Router = Router();

adminRouter.use(requireAdmin);

function parsePositiveInt(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function parseOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : undefined;
}

function currentEpochDay(): number {
  return Math.floor(Date.now() / 86_400_000);
}

function defaultFixtureSyncDays(): number {
  return 10;
}

function oddsMarketKey(snapshot: {
  BookmakerId: number;
  SuperOddsType: string;
  MarketParameters?: string;
  MarketPeriod?: string;
}): string {
  return [
    snapshot.BookmakerId,
    snapshot.SuperOddsType,
    snapshot.MarketPeriod ?? "",
    snapshot.MarketParameters ?? "",
  ].join(":");
}

function oddsMarketTitle(fixture: {
  homeTeam: string;
  awayTeam: string;
}, marketName: string): string {
  return `${fixture.homeTeam} vs ${fixture.awayTeam} - ${marketName}`;
}

// POST /admin/txodds/sync-fixtures - pull fixture snapshot into local DB
adminRouter.post("/txodds/sync-fixtures", async (req: Request, res: Response) => {
  try {
    const txodds = new TxOddsService();
    const startEpochDay = parseOptionalInt(req.body.startEpochDay) ?? currentEpochDay();
    const days = Math.max(1, Math.min(parseOptionalInt(req.body.days) ?? defaultFixtureSyncDays(), 10));
    const competitionId = parseOptionalInt(req.body.competitionId);
    const fixturesById = new Map<number, Awaited<ReturnType<TxOddsService["fetchFixtures"]>>[number]>();

    for (let offset = 0; offset < days; offset += 1) {
      const fixturesForDay = await txodds.fetchFixtures({
        startEpochDay: startEpochDay + offset,
        competitionId,
      });
      for (const fixture of fixturesForDay) {
        fixturesById.set(fixture.FixtureId, fixture);
      }
    }

    const synced = [];
    for (const f of fixturesById.values()) {
      const homeTeam = f.Participant1IsHome ? f.Participant1 : f.Participant2;
      const awayTeam = f.Participant1IsHome ? f.Participant2 : f.Participant1;
      const fixture = await prisma.fixture.upsert({
        where: { id: f.FixtureId },
        create: {
          id: f.FixtureId,
          externalSource: "txodds",
          externalId: String(f.FixtureId),
          sport: "football",
          homeTeam,
          awayTeam,
          league: f.Competition,
          startsAt: toDateFromMs(f.StartTime),
          status: txOddsGameStateToStatus(f.GameState),
          lastSyncedAt: new Date(),
        },
        update: {
          externalSource: "txodds",
          externalId: String(f.FixtureId),
          sport: "football",
          homeTeam,
          awayTeam,
          league: f.Competition,
          startsAt: toDateFromMs(f.StartTime),
          status: txOddsGameStateToStatus(f.GameState),
          lastSyncedAt: new Date(),
        },
      });
      synced.push(fixture);
    }

    res.json({ count: synced.length, days, data: synced });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/txodds/fixtures/:id/sync-odds - pull odds and create candidate markets
adminRouter.post("/txodds/fixtures/:id/sync-odds", async (req: Request, res: Response) => {
  try {
    const fixtureId = parsePositiveInt(req.params.id);
    if (!fixtureId) {
      res.status(400).json({ error: "Invalid fixture id" });
      return;
    }

    const fixture = await prisma.fixture.findUnique({ where: { id: fixtureId } });
    if (!fixture) {
      res.status(404).json({ error: "Fixture not found. Sync fixtures first." });
      return;
    }

    const txodds = new TxOddsService();
    const snapshots = await txodds.fetchOddsSnapshot(
      fixtureId,
      parseOptionalInt(req.body.asOf)
    );

    let oddsCreated = 0;
    let candidatesCreated = 0;
    const seenCandidates = new Set<string>();

    for (const snapshot of snapshots) {
      const marketKey = oddsMarketKey(snapshot);
      const marketName = snapshot.SuperOddsType;
      const names = snapshot.PriceNames ?? [];
      const prices = snapshot.Prices ?? [];
      const percentages = snapshot.Pct ?? [];

      for (let i = 0; i < Math.max(names.length, prices.length); i++) {
        await prisma.oddsSnapshot.create({
          data: {
            fixtureId,
            provider: "txodds",
            marketKey,
            marketName,
            selection: names[i] ?? `Selection ${i + 1}`,
            priceDecimal: prices[i] == null ? undefined : Number(prices[i]),
            impliedProbability:
              percentages[i] && percentages[i] !== "NA"
                ? Number(percentages[i])
                : undefined,
            raw: snapshot as any,
            capturedAt: toDateFromMs(snapshot.Ts),
          },
        });
        oddsCreated++;
      }

      if (!seenCandidates.has(marketKey)) {
        seenCandidates.add(marketKey);
        const existing = await prisma.marketCandidate.findFirst({
          where: {
            fixtureId,
            source: "txodds",
            sourceMarketId: marketKey,
          },
        });
        if (!existing) {
          const mapping = mapTxOddsSnapshotToStatKey(snapshot);
          await prisma.marketCandidate.create({
            data: {
              fixtureId,
              source: "txodds",
              sourceMarketId: marketKey,
              statKey: mapping.statKey ?? undefined,
              statLabel: mapping.statLabel,
              marketType: marketName,
              title: oddsMarketTitle(fixture, marketName),
              numBuckets: Math.max(names.length, 2),
              startsAt: fixture.startsAt,
              raw: snapshot as any,
            },
          });
          candidatesCreated++;
        } else {
          const mapping = mapTxOddsSnapshotToStatKey(snapshot);
          await prisma.marketCandidate.update({
            where: { id: existing.id },
            data: {
              statKey: mapping.statKey ?? undefined,
              statLabel: mapping.statLabel,
              marketType: marketName,
              title: oddsMarketTitle(fixture, marketName),
              numBuckets: Math.max(names.length, 2),
              startsAt: fixture.startsAt,
              raw: snapshot as any,
            },
          });
        }
      }
    }

    res.json({
      fixtureId,
      oddsCreated,
      candidatesCreated,
      snapshots: snapshots.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/fixtures - upsert a fixture from TXOdds or manual admin input
adminRouter.post("/fixtures", async (req: Request, res: Response) => {
  try {
    const {
      id,
      externalSource,
      externalId,
      sport,
      country,
      homeTeam,
      awayTeam,
      league,
      startsAt,
      status,
    } = req.body;

    const fixtureId = parsePositiveInt(id);
    if (!fixtureId || !homeTeam || !awayTeam || !league || !startsAt) {
      res.status(400).json({
        error: "id, homeTeam, awayTeam, league, and startsAt are required",
      });
      return;
    }

    const fixture = await prisma.fixture.upsert({
      where: { id: fixtureId },
      create: {
        id: fixtureId,
        externalSource,
        externalId,
        sport,
        country,
        homeTeam,
        awayTeam,
        league,
        startsAt: new Date(startsAt),
        status,
        lastSyncedAt: new Date(),
      },
      update: {
        externalSource,
        externalId,
        sport,
        country,
        homeTeam,
        awayTeam,
        league,
        startsAt: new Date(startsAt),
        status,
        lastSyncedAt: new Date(),
      },
    });

    res.status(201).json(fixture);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/fixtures/:id/candidates - create a candidate market for review
adminRouter.post(
  "/fixtures/:id/candidates",
  async (req: Request, res: Response) => {
    try {
      const fixtureId = parsePositiveInt(req.params.id);
      if (!fixtureId) {
        res.status(400).json({ error: "Invalid fixture id" });
        return;
      }

      const {
        source,
        sourceMarketId,
        statKey,
        statLabel,
        marketType,
        title,
        numBuckets,
        startsAt,
        raw,
      } = req.body;

      if (!statLabel || !title) {
        res.status(400).json({ error: "statLabel and title are required" });
        return;
      }

      const candidate = await prisma.marketCandidate.create({
        data: {
          fixtureId,
          source,
          sourceMarketId,
          statKey: statKey == null ? undefined : Number(statKey),
          statLabel,
          marketType,
          title,
          numBuckets: numBuckets == null ? undefined : Number(numBuckets),
          startsAt: startsAt ? new Date(startsAt) : undefined,
          raw,
        },
      });

      res.status(201).json(candidate);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// GET /admin/candidates?status=candidate|approved|rejected|published
adminRouter.get("/candidates", async (req: Request, res: Response) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const candidates = await prisma.marketCandidate.findMany({
      where: status ? { status } : undefined,
      include: { fixture: true, onChainMarket: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: candidates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /admin/candidates/:id/status - approve or reject a candidate
adminRouter.patch("/candidates/:id/status", async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const allowed = new Set(["candidate", "approved", "rejected", "published"]);
    if (!allowed.has(status)) {
      res.status(400).json({
        error: "status must be candidate, approved, rejected, or published",
      });
      return;
    }

    const candidate = await prisma.marketCandidate.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(candidate);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /admin/candidates/:id/link-market - link an approved candidate to an on-chain market id
adminRouter.post("/candidates/:id/link-market", async (req: Request, res: Response) => {
  try {
    const candidate = await prisma.marketCandidate.findUnique({
      where: { id: req.params.id },
      include: { fixture: true },
    });
    if (!candidate) {
      res.status(404).json({ error: "Candidate not found" });
      return;
    }
    if (!["candidate", "approved", "published"].includes(candidate.status)) {
      res.status(409).json({ error: "Rejected candidates cannot be linked" });
      return;
    }

    const marketId = parsePositiveInt(req.body.marketId);
    const statKey =
      req.body.statKey == null ? candidate.statKey : Number(req.body.statKey);
    if (!marketId || statKey == null || !Number.isInteger(statKey)) {
      res.status(400).json({ error: "marketId and statKey are required" });
      return;
    }

    const market = await prisma.market.upsert({
      where: { id: marketId },
      create: {
        id: marketId,
        fixtureId: candidate.fixtureId,
        statKey,
        statLabel: candidate.statLabel,
        title: candidate.title,
        marketType: candidate.marketType,
        externalMarketId: candidate.sourceMarketId,
        status: "open",
      },
      update: {
        fixtureId: candidate.fixtureId,
        statKey,
        statLabel: candidate.statLabel,
        title: candidate.title,
        marketType: candidate.marketType,
        externalMarketId: candidate.sourceMarketId,
        status: "open",
      },
    });

    const updatedCandidate = await prisma.marketCandidate.update({
      where: { id: candidate.id },
      data: {
        status: "published",
        onChainMarketId: market.id,
      },
      include: { fixture: true, onChainMarket: true },
    });

    res.status(201).json({ candidate: updatedCandidate, market });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
