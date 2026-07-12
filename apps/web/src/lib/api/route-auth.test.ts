import { afterEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { verifyApiAuth } from "@/lib/api/route-auth";

describe("verifyApiAuth", () => {
  const original = process.env.API_AUTH_TOKEN;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.API_AUTH_TOKEN;
    } else {
      process.env.API_AUTH_TOKEN = original;
    }
  });

  it("allows requests when API_AUTH_TOKEN is unset", () => {
    delete process.env.API_AUTH_TOKEN;
    const request = new NextRequest("http://localhost/api/markets");
    expect(verifyApiAuth(request)).toBeNull();
  });

  it("rejects missing bearer token", () => {
    process.env.API_AUTH_TOKEN = "secret";
    const request = new NextRequest("http://localhost/api/markets");
    const response = verifyApiAuth(request);
    expect(response?.status).toBe(401);
  });

  it("accepts matching bearer token", () => {
    process.env.API_AUTH_TOKEN = "secret";
    const request = new NextRequest("http://localhost/api/markets", {
      headers: { authorization: "Bearer secret" },
    });
    expect(verifyApiAuth(request)).toBeNull();
  });
});
