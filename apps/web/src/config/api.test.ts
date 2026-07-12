import { afterEach, describe, expect, it } from "vitest";
import {
  assertCanSubmitOnChainTx,
  canSubmitOnChainTx,
  isApiEnabled,
  ONCHAIN_TX_DISABLED_MESSAGE,
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

    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";
    expect(isApiEnabled()).toBe(true);
  });

  it("blocks on-chain txs when API mode is enabled", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";
    expect(canSubmitOnChainTx(true)).toBe(false);
    expect(canSubmitOnChainTx(false)).toBe(false);

    delete process.env.NEXT_PUBLIC_API_URL;
    expect(canSubmitOnChainTx(true)).toBe(true);
    expect(canSubmitOnChainTx(false)).toBe(false);
  });

  it("throws a clear error when submitting txs in API mode", () => {
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:3000/api";
    expect(() => assertCanSubmitOnChainTx(true)).toThrow(ONCHAIN_TX_DISABLED_MESSAGE);
    expect(() => assertCanSubmitOnChainTx(false)).toThrow("Wallet not connected");
  });
});
