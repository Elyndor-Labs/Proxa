import { NextResponse } from "next/server";

/** Returns 401 when the request is missing a valid API bearer token. */
export function verifyApiAuth(request: Request): NextResponse | null {
  const expected = process.env.API_AUTH_TOKEN;
  if (!expected) return null;

  const header = request.headers.get("authorization");
  if (header === `Bearer ${expected}`) return null;

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Runs auth check before executing a mock API route handler. */
export async function withApiAuth(
  request: Request,
  handler: () => NextResponse | Promise<NextResponse>,
): Promise<NextResponse> {
  const denied = verifyApiAuth(request);
  if (denied) return denied;
  return handler();
}
