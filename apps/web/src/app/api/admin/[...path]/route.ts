import { NextRequest, NextResponse } from "next/server";

function apiBase(): string {
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not configured");
  return base.replace(/\/$/, "");
}

function adminKey(): string {
  const key = process.env.ADMIN_API_KEY;
  if (!key) throw new Error("ADMIN_API_KEY is not configured");
  return key;
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
