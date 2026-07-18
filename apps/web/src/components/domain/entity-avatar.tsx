import { entityAvatarStyle, entityInitials } from "@/lib/format/entity";
import { cn } from "@/lib/utils";

interface EntityAvatarProps {
  fixtureId: string;
  statLabel?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE = {
  sm: "h-7 w-7 text-[10px]",
  md: "h-9 w-9 text-xs",
  lg: "h-11 w-11 text-sm",
} as const;

/** Colored initials circle for fixture/entity identity on cards. */
export function EntityAvatar({ fixtureId, statLabel, size = "md", className }: EntityAvatarProps) {
  const initials = entityInitials(fixtureId, statLabel);
  return (
    <span
      className={cn(
        "entity-avatar inline-flex shrink-0 items-center justify-center rounded-full border font-label font-bold uppercase",
        SIZE[size],
        className,
      )}
      style={entityAvatarStyle(fixtureId)}
      aria-hidden
    >
      {initials}
    </span>
  );
}
