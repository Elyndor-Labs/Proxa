export interface TxOddsFixture {
  Ts: number;
  StartTime: number;
  Competition: string;
  CompetitionId: number;
  FixtureGroupId: number;
  Participant1Id: number;
  Participant1: string;
  Participant2Id: number;
  Participant2: string;
  FixtureId: number;
  Participant1IsHome: boolean;
  GameState?: number;
}

export interface TxOddsSnapshot {
  FixtureId: number;
  MessageId: string;
  Ts: number;
  Bookmaker: string;
  BookmakerId: number;
  SuperOddsType: string;
  InRunning: boolean;
  GameState?: string;
  MarketParameters?: string;
  MarketPeriod?: string;
  PriceNames?: string[];
  Prices?: number[];
  Pct?: string[];
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export class TxOddsService {
  private readonly baseUrl = requiredEnv("TXODDS_API_BASE").replace(/\/$/, "");
  private readonly guestJwt = requiredEnv("TXODDS_GUEST_JWT");
  private readonly apiToken = requiredEnv("TXODDS_API_KEY");

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.guestJwt}`,
      "X-Api-Token": this.apiToken,
    };
  }

  async fetchFixtures(params: {
    startEpochDay?: number;
    competitionId?: number;
  } = {}): Promise<TxOddsFixture[]> {
    const url = new URL(`${this.baseUrl}/api/fixtures/snapshot`);
    if (params.startEpochDay !== undefined) {
      url.searchParams.set("startEpochDay", String(params.startEpochDay));
    }
    if (params.competitionId !== undefined) {
      url.searchParams.set("competitionId", String(params.competitionId));
    }

    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`TXOdds fixtures ${res.status}: ${await res.text()}`);
    return (await res.json()) as TxOddsFixture[];
  }

  async fetchOddsSnapshot(
    fixtureId: number,
    asOf?: number
  ): Promise<TxOddsSnapshot[]> {
    const url = new URL(`${this.baseUrl}/api/odds/snapshot/${fixtureId}`);
    if (asOf !== undefined) url.searchParams.set("asOf", String(asOf));

    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error(`TXOdds odds ${res.status}: ${await res.text()}`);
    return (await res.json()) as TxOddsSnapshot[];
  }
}

export function txOddsGameStateToStatus(gameState?: number | string): string {
  switch (String(gameState ?? "")) {
    case "1":
      return "scheduled";
    case "6":
      return "cancelled";
    default:
      return "scheduled";
  }
}

export function toDateFromMs(ms: number): Date {
  return new Date(ms);
}
