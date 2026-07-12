import type { z } from "zod";
import { getApiAuthHeaders, getApiBaseUrl } from "@/config/api";
import { ApiError } from "@/lib/api/errors";

/** Thin fetch wrapper for the Proxa REST API with optional Zod validation. */

export async function apiParse<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const json = await apiJson(path, init);
  return schema.parse(json);
}

export async function apiJson(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
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

  if (res.status === 204) return null;
  return res.json();
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
