import {
  Flag,
  Goal,
  RectangleVertical,
  Trophy,
  type LucideIcon,
} from "lucide-react";

/** Pick a category glyph from market stat label. */
export function marketCategoryIcon(statLabel: string): LucideIcon {
  const s = statLabel.toLowerCase();
  if (s.includes("yellow") || s.includes("red") || s.includes("card")) {
    return RectangleVertical;
  }
  if (s.includes("goal")) return Goal;
  if (s.includes("corner")) return Flag;
  return Trophy;
}

/** Soft hue pair for banner gradients (mint ↔ rose family). */
export function marketBannerHues(seed: string): { a: number; b: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return {
    a: 120 + (Math.abs(hash) % 35),
    b: 350 + (Math.abs(hash >> 3) % 25),
  };
}
