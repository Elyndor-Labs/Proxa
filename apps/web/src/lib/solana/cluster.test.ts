import { describe, expect, it } from "vitest";
import { getDefaultCluster, getRpcForCluster } from "@/lib/solana/cluster";

describe("cluster utils", () => {
  it("defaults to devnet", () => {
    expect(getDefaultCluster()).toBe("devnet");
  });

  it("returns public RPC endpoints per cluster", () => {
    expect(getRpcForCluster("devnet")).toContain("devnet");
    expect(getRpcForCluster("mainnet-beta")).toContain("mainnet");
  });
});
