import { afterEach, describe, expect, it } from "vitest";
import {
  assertCanSubmitOnChainTx,
  canSubmitOnChainTx,
  isApiEnabled,
} from "@/config/api";

describe("api config", () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;

  afterEach(() => {
    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
  });

  it("detects API mode from NEXT_PUBLIC_API_URL", () => {
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(isApiEnabled()).toBe(false);

    process.env.NEXT_PUBLIC_API_URL = "https://proxa-gzk8.onrender.com";
    expect(isApiEnabled()).toBe(true);
  });

  it("allows on-chain txs when wallet is connected", () => {
    process.env.NEXT_PUBLIC_API_URL = "https://proxa-gzk8.onrender.com";
    expect(canSubmitOnChainTx(true)).toBe(true);
    expect(canSubmitOnChainTx(false)).toBe(false);

    delete process.env.NEXT_PUBLIC_API_URL;
    expect(canSubmitOnChainTx(true)).toBe(true);
    expect(canSubmitOnChainTx(false)).toBe(false);
  });

  it("throws when wallet is not connected", () => {
    expect(() => assertCanSubmitOnChainTx(false)).toThrow("Wallet not connected");
    expect(() => assertCanSubmitOnChainTx(true)).not.toThrow();
  });
});
