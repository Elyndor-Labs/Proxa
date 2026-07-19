import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Shimmer placeholder while async data loads. */
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}
