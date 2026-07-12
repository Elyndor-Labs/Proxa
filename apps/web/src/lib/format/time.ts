/** Human-readable relative time until a unix-ms timestamp. */
export function formatTimeRemaining(targetMs: number): string {
  const diff = targetMs - Date.now();
  if (diff <= 0) return "Closed";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;

  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}
