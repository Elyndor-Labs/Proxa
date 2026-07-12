import type { z } from "zod";
import { getApiAuthHeaders } from "@/config/api";
import { ApiError } from "@/lib/api/errors";

/** Thin fetch wrapper for the Proxa REST API with optional Zod validation. */

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return base.replace(/\/$/, "");
}

export async function apiParse<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${getBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...getApiAuthHeaders(),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const message = await readErrorMessage(res);
    throw new ApiError(res.status, message);
  }

  const json: unknown = await res.json();
  return schema.parse(json);
}

async function readErrorMessage(res: Response): Promise<string> {
  const text = await res.text();
  if (!text) {
    return res.statusText || "Request failed";
  }

  try {
    const body = JSON.parse(text) as { error?: string; message?: string };
    return body.error ?? body.message ?? text;
  } catch {
    return text;
  }
}
