import { describe, expect, it } from "vitest";
import { getAstronomyState } from "./astronomy";
import { TOKYO_LOCATION } from "./locations";

describe("getAstronomyState", () => {
  it("keeps altitude signed while normalizing azimuth", () => {
    const state = getAstronomyState(new Date("2026-07-05T00:00:00+09:00"), TOKYO_LOCATION);

    expect(state.sunAzimuth).toBeGreaterThanOrEqual(0);
    expect(state.sunAzimuth).toBeLessThan(360);
    expect(state.moonAzimuth).toBeGreaterThanOrEqual(0);
    expect(state.moonAzimuth).toBeLessThan(360);

    expect(state.sunAltitude).toBeGreaterThanOrEqual(-90);
    expect(state.sunAltitude).toBeLessThanOrEqual(90);
    expect(state.moonAltitude).toBeGreaterThanOrEqual(-90);
    expect(state.moonAltitude).toBeLessThanOrEqual(90);
    expect(state.sunAltitude).toBeLessThan(0);
  });
});
