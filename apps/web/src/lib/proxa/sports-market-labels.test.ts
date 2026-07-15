import { describe, expect, it } from "vitest";
import {
  formatSportsMarketName,
  parseMarketLine,
  rawMarketParameters,
} from "@/lib/proxa/sports-market-labels";

describe("sports market labels", () => {
  it("extracts market line parameters from TXOdds raw payloads", () => {
    const raw = { MarketParameters: "line=2.5;scope=match" };
    expect(rawMarketParameters(raw)).toBe("line=2.5;scope=match");
    expect(parseMarketLine(rawMarketParameters(raw))).toBe("2.5");
  });

  it("supports legacy lower-case raw parameters", () => {
    expect(rawMarketParameters({ parameters: "line=4.5" })).toBe("line=4.5");
  });

  it("formats known TXOdds markets with the parsed line", () => {
    expect(formatSportsMarketName("OVERUNDER_PARTICIPANT_GOALS", "line=2.5")).toBe(
      "Total Goals 2.5",
    );
  });
});
