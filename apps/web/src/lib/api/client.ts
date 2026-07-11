/** Thin fetch wrapper for the Proxa REST API. */

export function isApiEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return base.replace(/\/$/, "");
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text()}`);
  }

  return res.json() as Promise<T>;
}
