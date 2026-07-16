import { MAX_BUCKETS } from "./constants";

/** Count-style bounds: bucket i = i (last overflows). */
export function countBucketBounds(numBuckets: number): number[] {
  const bounds = Array.from({ length: MAX_BUCKETS }, () => 0);
  for (let i = 0; i < numBuckets; i += 1) bounds[i] = i;
  return bounds;
}

/**
 * Binary under/over: bucket 0 is [0, overFrom), bucket 1 is [overFrom, +inf).
 * For "Over 4.5" goals use overFrom = 5.
 */
export function thresholdBucketBounds(overFrom: number): number[] {
  if (!Number.isInteger(overFrom) || overFrom < 1) {
    throw new Error("overFrom must be an integer >= 1");
  }
  const bounds = Array.from({ length: MAX_BUCKETS }, () => 0);
  bounds[0] = 0;
  bounds[1] = overFrom;
  return bounds;
}

/** Half-line helper: Over 4.5 → overFrom 5. */
export function overFromHalfLine(line: number): number {
  return Math.floor(line) + 1;
}

export function padBucketBounds(bounds: number[]): number[] {
  const out = Array.from({ length: MAX_BUCKETS }, () => 0);
  for (let i = 0; i < Math.min(bounds.length, MAX_BUCKETS); i += 1) {
    out[i] = bounds[i];
  }
  return out;
}

export function expectedWinningBucket(
  value: number,
  numBuckets: number,
  bucketBounds?: number[] | null,
): number {
  const bounds = bucketBounds?.length ? bucketBounds : countBucketBounds(numBuckets);
  for (let i = 0; i < numBuckets - 1; i += 1) {
    if (value < bounds[i + 1]) return i;
  }
  return numBuckets - 1;
}

export function bucketLabelFromBounds(
  index: number,
  numBuckets: number,
  bounds: number[],
  unit = "value",
): string {
  const lo = bounds[index] ?? index;
  if (numBuckets === 2 && index === 0 && lo === 0 && Number.isInteger(bounds[1]) && bounds[1] > 1) {
    return `Under ${bounds[1] - 0.5} ${unit}`;
  }
  if (numBuckets === 2 && index === 1 && Number.isInteger(lo) && lo > 1) {
    return `Over ${lo - 0.5} ${unit}`;
  }
  if (index === numBuckets - 1) return `${lo}+ ${unit}`;
  const hi = (bounds[index + 1] ?? lo + 1) - 1;
  if (hi === lo) return `${lo} ${unit}`;
  return `${lo}-${hi} ${unit}`;
}

export function bucketLabelsFromBounds(
  numBuckets: number,
  bounds: number[],
  unit = "value",
): string[] {
  return Array.from({ length: numBuckets }, (_, i) =>
    bucketLabelFromBounds(i, numBuckets, bounds, unit),
  );
}
