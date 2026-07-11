import { NextResponse } from "next/server";
import { getMockLeaderboard } from "@/lib/api/mock-data";
import { withApiAuth } from "@/lib/api/route-auth";

/** Mock GET /leaderboard */
export async function GET(request: Request) {
  return withApiAuth(request, async () => {
    return NextResponse.json(getMockLeaderboard());
  });
}
