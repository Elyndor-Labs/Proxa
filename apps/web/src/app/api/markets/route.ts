import { NextResponse } from "next/server";
import { filterMockMarkets } from "@/lib/api/mock-data";
import { withApiAuth } from "@/lib/api/route-auth";

/** Mock GET /markets — paginated list with optional filters. */
export async function GET(request: Request) {
  return withApiAuth(request, async () => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const fixtureId = searchParams.get("fixtureId");
    const q = searchParams.get("q");
    const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50") || 50));

    const filtered = filterMockMarkets({ status, fixtureId, q });
    const total = filtered.length;
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);

    return NextResponse.json({ items, total, page, limit });
  });
}
