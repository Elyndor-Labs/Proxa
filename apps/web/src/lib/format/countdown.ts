export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  closed: boolean;
}

/** Segmented countdown parts from a unix-ms target. */
export function getCountdownParts(targetMs: number, now = Date.now()): CountdownParts {
  const diff = targetMs - now;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, closed: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, closed: false };
}

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}
