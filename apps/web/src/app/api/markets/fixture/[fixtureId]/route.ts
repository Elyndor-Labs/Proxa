import { NextResponse } from "next/server";
import { getMockMarketsByFixture } from "@/lib/api/mock-data";
import { withApiAuth } from "@/lib/api/route-auth";

interface RouteContext {
  params: Promise<{ fixtureId: string }>;
}

/** Mock GET /markets/fixture/:fixtureId */
export async function GET(request: Request, context: RouteContext) {
  return withApiAuth(request, async () => {
    const { fixtureId } = await context.params;
    return NextResponse.json(getMockMarketsByFixture(fixtureId));
  });
}
