import type { CSSProperties } from "react";

/** Deterministic hue from a string for avatar backgrounds (stays in green family). */
function hashHue(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 120 + (Math.abs(hash) % 40);
}

/** Two-letter initials for fixture/entity avatars. */
export function entityInitials(fixtureId: string, statLabel?: string): string {
  if (statLabel) {
    const words = statLabel.replace(/[·]/g, " ").split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0]![0] ?? ""}${words[1]![0] ?? ""}`.toUpperCase();
    }
    if (words[0]) return words[0].slice(0, 2).toUpperCase();
  }
  const id = fixtureId.replace(/\D/g, "");
  return id.length >= 2 ? `#${id.slice(-2)}` : "FX";
}

/** Inline styles for a muted avatar circle keyed to fixture id. */
export function entityAvatarStyle(fixtureId: string): CSSProperties {
  const hue = hashHue(fixtureId);
  return {
    background: `hsla(${hue}, 35%, 18%, 1)`,
    borderColor: `hsla(${hue}, 45%, 35%, 0.45)`,
    color: `hsla(${hue}, 55%, 72%, 1)`,
  };
}
