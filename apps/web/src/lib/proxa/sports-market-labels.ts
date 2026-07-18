interface FixtureTeams {
  homeTeam: string;
  awayTeam: string;
}

const MARKET_LABELS: Record<string, string> = {
  "1X2_PARTICIPANT_RESULT": "Match Winner",
  "OVERUNDER_PARTICIPANT_GOALS": "Total Goals",
};

const SELECTION_LABELS: Record<string, string> = {
  part1: "Home",
  part2: "Away",
  draw: "Draw",
  over: "Over",
  under: "Under",
};

export function formatSportsMarketName(marketName: string, parameters?: string | null): string {
  const label = MARKET_LABELS[marketName] ?? marketName.replaceAll("_", " ");
  const line = parseMarketLine(parameters);
  return line ? `${label} ${line}` : label;
}

export function formatSportsSelection(selection: string, teams?: FixtureTeams): string {
  if (selection === "part1" && teams) return teams.homeTeam;
  if (selection === "part2" && teams) return teams.awayTeam;
  return SELECTION_LABELS[selection] ?? titleCase(selection.replaceAll("_", " "));
}

export function formatTxOddsPrice(price?: number | null): string {
  if (price == null || Number.isNaN(price)) return "-";
  const decimal = price > 100 ? price / 1000 : price;
  return decimal.toFixed(2);
}

export function formatProbability(probability?: number | null): string {
  if (probability == null || Number.isNaN(probability)) return "No implied probability";
  return `${probability.toFixed(1)}% implied`;
}

export function parseMarketLine(parameters?: string | null): string | null {
  if (!parameters) return null;
  const line = parameters
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("line="));

  return line ? line.slice("line=".length) : null;
}

export function rawMarketParameters(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;
  const value = record.MarketParameters ?? record.parameters;
  return typeof value === "string" ? value : null;
}

export function rawSuperOddsType(raw: unknown): string | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = (raw as Record<string, unknown>).SuperOddsType;
  return typeof value === "string" ? value : null;
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ");
}
