import { NextResponse } from "next/server";
import { getMockMarket } from "@/lib/api/mock-data";
import { withApiAuth } from "@/lib/api/route-auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** Mock GET /markets/:id */
export async function GET(request: Request, context: RouteContext) {
  return withApiAuth(request, async () => {
    const { id } = await context.params;
    const market = getMockMarket(id);

    if (!market) {
      return NextResponse.json({ error: "Market not found" }, { status: 404 });
    }

    return NextResponse.json(market);
  });
}
