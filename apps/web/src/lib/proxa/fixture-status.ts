const UNAVAILABLE_FIXTURE_STATUSES = new Set(["cancelled", "postponed", "abandoned"]);

export function isFixtureUnavailable(status: string | undefined): boolean {
  if (!status) return false;
  return UNAVAILABLE_FIXTURE_STATUSES.has(status.trim().toLowerCase());
}

export function fixtureUnavailableLabel(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "cancelled") return "Cancelled";
  if (normalized === "postponed") return "Postponed";
  if (normalized === "abandoned") return "Abandoned";
  return status;
}

export function fixtureUnavailableMessage(status: string): string {
  const label = fixtureUnavailableLabel(status);
  return `${label} fixture. Bets are paused; open positions will be refunded after the market is voided on-chain.`;
}
