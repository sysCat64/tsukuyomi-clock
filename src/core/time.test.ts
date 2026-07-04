import { describe, expect, it } from "vitest";
import { getAnalogAngles, getClockState } from "./time";

describe("getClockState", () => {
  it("formats local instants as Asia/Tokyo calendar values", () => {
    const state = getClockState(new Date(Date.UTC(2026, 0, 1, 15, 4, 5)));

    expect(state.dateLabelJa).toBe("2026年1月2日");
    expect(state.timeLabel).toBe("00:04:05");
    expect(state.weekdayLabelJa).toBe("金曜日");
    expect(state.eraLabelJa).toContain("令和");
  });
});

describe("getAnalogAngles", () => {
  it("calculates smooth analog hand angles", () => {
    const state = getClockState(new Date(Date.UTC(2026, 0, 1, 3, 30, 0)));
    const angles = getAnalogAngles(state);

    expect(angles.hour).toBeCloseTo(15);
    expect(angles.minute).toBeCloseTo(180);
    expect(angles.second).toBeCloseTo(0);
  });
});
