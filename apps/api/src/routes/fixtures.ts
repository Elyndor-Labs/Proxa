import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { requireAdmin } from "../middleware/adminAuth";

export const fixturesRouter: Router = Router();

const fixtureInclude = {
  markets: true,
  candidates: {
    orderBy: { createdAt: "desc" as const },
    take: 20,
  },
  odds: {
    orderBy: { capturedAt: "desc" as const },
    take: 20,
  },
};

function parseFixtureId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /fixtures - all fixtures
fixturesRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const fixtures = await prisma.fixture.findMany({
      orderBy: { startsAt: "asc" },
      include: fixtureInclude,
    });
    res.json({ data: fixtures });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /fixtures/:id/candidates - candidate markets for one fixture
fixturesRouter.get("/:id/candidates", async (req: Request, res: Response) => {
  try {
    const fixtureId = parseFixtureId(req.params.id);
    if (!fixtureId) {
      res.status(400).json({ error: "Invalid fixture id" });
      return;
    }

    const candidates = await prisma.marketCandidate.findMany({
      where: { fixtureId },
      include: { onChainMarket: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ data: candidates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /fixtures/:id/odds - latest odds snapshots for one fixture
fixturesRouter.get("/:id/odds", async (req: Request, res: Response) => {
  try {
    const fixtureId = parseFixtureId(req.params.id);
    if (!fixtureId) {
      res.status(400).json({ error: "Invalid fixture id" });
      return;
    }

    const marketKey =
      typeof req.query.marketKey === "string" ? req.query.marketKey : undefined;

    const odds = await prisma.oddsSnapshot.findMany({
      where: {
        fixtureId,
        ...(marketKey ? { marketKey } : {}),
      },
      orderBy: { capturedAt: "desc" },
      take: 100,
    });
    res.json({ data: odds });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /fixtures/:id - single fixture with markets, candidates, and latest odds
fixturesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseFixtureId(req.params.id);
    if (!id) {
      res.status(400).json({ error: "Invalid fixture id" });
      return;
    }

    const fixture = await prisma.fixture.findUnique({
      where: { id },
      include: fixtureInclude,
    });
    if (!fixture) {
      res.status(404).json({ error: "Fixture not found" });
      return;
    }
    res.json(fixture);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /fixtures - create fixture (admin only for now)
fixturesRouter.post("/", requireAdmin, async (req: Request, res: Response) => {
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

    const fixture = await prisma.fixture.create({
      data: {
        id: Number(id),
        externalSource,
        externalId,
        sport,
        country,
        homeTeam,
        awayTeam,
        league,
        startsAt: new Date(startsAt),
        status,
      },
    });
    res.status(201).json(fixture);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
