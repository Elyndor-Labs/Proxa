import { beforeEach, describe, expect, it } from "vitest";
import { useBetSlipStore } from "@/features/bet-slip/store";

describe("useBetSlipStore", () => {
  beforeEach(() => {
    useBetSlipStore.setState({ legs: [], open: false });
  });

  it("adds a leg and opens the slip", () => {
    useBetSlipStore.getState().addLeg({
      marketId: "1",
      title: "Test market",
      bucket: 0,
      bucketLabel: "0-1",
      amount: "10",
    });

    const state = useBetSlipStore.getState();
    expect(state.legs).toHaveLength(1);
    expect(state.open).toBe(true);
    expect(state.legs[0].amount).toBe("10");
  });

  it("updates an existing leg for the same market and bucket", () => {
    const { addLeg } = useBetSlipStore.getState();
    addLeg({ marketId: "1", title: "A", bucket: 0, bucketLabel: "0-1", amount: "5" });
    addLeg({ marketId: "1", title: "A", bucket: 0, bucketLabel: "0-1", amount: "25" });

    expect(useBetSlipStore.getState().legs).toHaveLength(1);
    expect(useBetSlipStore.getState().legs[0].amount).toBe("25");
  });

  it("supports multiple legs across markets", () => {
    const { addLeg } = useBetSlipStore.getState();
    addLeg({ marketId: "1", title: "A", bucket: 0, bucketLabel: "0-1", amount: "5" });
    addLeg({ marketId: "2", title: "B", bucket: 1, bucketLabel: "2+", amount: "15" });

    expect(useBetSlipStore.getState().legs).toHaveLength(2);
  });

  it("removes a leg and closes when empty", () => {
    const { addLeg, removeLeg } = useBetSlipStore.getState();
    addLeg({ marketId: "1", title: "A", bucket: 0, bucketLabel: "0-1", amount: "5" });
    const id = useBetSlipStore.getState().legs[0].id;
    removeLeg(id);

    expect(useBetSlipStore.getState().legs).toHaveLength(0);
    expect(useBetSlipStore.getState().open).toBe(false);
  });
});
