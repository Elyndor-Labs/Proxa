import { describe, expect, it } from "vitest";
import {
  fixtureUnavailableMessage,
  isFixtureUnavailable,
} from "@/lib/proxa/fixture-status";

describe("fixture status helpers", () => {
  it("detects unavailable fixture states", () => {
    expect(isFixtureUnavailable("cancelled")).toBe(true);
    expect(isFixtureUnavailable("Postponed")).toBe(true);
    expect(isFixtureUnavailable("scheduled")).toBe(false);
  });

  it("explains refund behavior for unavailable fixtures", () => {
    expect(fixtureUnavailableMessage("cancelled")).toContain("refunded");
  });
});
