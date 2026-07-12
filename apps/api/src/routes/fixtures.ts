import { prisma } from "../db";
import { Router, Request, Response } from "express";

export const fixturesRouter: Router = Router();

// GET /fixtures — all fixtures
fixturesRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const fixtures = await prisma.fixture.findMany({
      orderBy: { startsAt: "asc" },
      include: { markets: true },
    });
    res.json({ data: fixtures });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /fixtures/:id — single fixture with its markets
fixturesRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const fixture = await prisma.fixture.findUnique({
      where: { id: Number(req.params.id) },
      include: { markets: true },
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

// POST /fixtures — create fixture (admin only for now)
fixturesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const { id, homeTeam, awayTeam, league, startsAt } = req.body;
    const fixture = await prisma.fixture.create({
      data: {
        id: Number(id),
        homeTeam,
        awayTeam,
        league,
        startsAt: new Date(startsAt),
      },
    });
    res.status(201).json(fixture);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
