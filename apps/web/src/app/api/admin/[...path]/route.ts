import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return base.replace(/\/$/, "");
}

function adminKey(): string {
  const key = process.env.ADMIN_API_KEY ?? readApiAdminKey();
  if (!key) throw new Error("ADMIN_API_KEY is not configured");
  return key;
}

function readApiAdminKey(): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;

  try {
    const envPath = resolve(process.cwd(), "../api/.env");
    const env = readFileSync(envPath, "utf8");
    const line = env
      .split(/\r?\n/)
      .map((entry) => entry.trim())
      .find((entry) => entry.startsWith("ADMIN_API_KEY="));
    return line?.slice("ADMIN_API_KEY=".length).trim();
  } catch {
    return undefined;
  }
}

async function proxyAdmin(req: NextRequest, pathSegments: string[]) {
  const path = pathSegments.join("/");
  const url = `${apiBase()}/admin/${path}${req.nextUrl.search}`;

  const headers: Record<string, string> = {
    "x-admin-key": adminKey(),
  };
  const contentType = req.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  const res = await fetch(url, init);
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await ctx.params;
    return proxyAdmin(req, path);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Admin proxy failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await ctx.params;
    return proxyAdmin(req, path);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Admin proxy failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await ctx.params;
    return proxyAdmin(req, path);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Admin proxy failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
