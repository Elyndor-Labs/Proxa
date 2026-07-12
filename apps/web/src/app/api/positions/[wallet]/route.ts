import { NextResponse } from "next/server";
import { getMockPositions } from "@/lib/api/mock-data";
import { withApiAuth } from "@/lib/api/route-auth";

interface RouteContext {
  params: Promise<{ wallet: string }>;
}

/** Mock GET /positions/:wallet */
export async function GET(request: Request, context: RouteContext) {
  return withApiAuth(request, async () => {
    const { wallet } = await context.params;
    return NextResponse.json(getMockPositions(wallet));
  });
}
