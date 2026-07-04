import { describe, expect, it } from "vitest";
import { getAlmanacState } from "./almanac";

describe("getAlmanacState", () => {
  it("returns a solar term and micro season for a fixed date", () => {
    const state = getAlmanacState(new Date(Date.UTC(2026, 2, 20, 12, 0, 0)));

    expect(state.solarTerm.length).toBeGreaterThan(0);
    expect(state.microSeason.length).toBeGreaterThan(0);
    expect(state.solarTermProgress).toBeGreaterThanOrEqual(0);
    expect(state.solarTermProgress).toBeLessThanOrEqual(1);
  });
});
