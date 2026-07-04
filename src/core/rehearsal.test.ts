import { describe, expect, it } from "vitest";
import {
  advanceRehearsalTime,
  getEffectiveReducedMotion,
  getRehearsalPlaybackDelta,
  getRehearsalScenario,
  mergeMotionEvents,
  parseRehearsalParams,
} from "./rehearsal";

const FALLBACK_NOW = new Date("2026-07-05T00:00:00+09:00");

describe("parseRehearsalParams", () => {
  it("enables keiko mode from URL parameters", () => {
    const state = parseRehearsalParams(
      "?keiko=1&at=2026-07-05T06:30:00%2B09:00&speed=60&play=1&motion=reduce",
      FALLBACK_NOW,
    );

    expect(state.enabled).toBe(true);
    expect(state.now.toISOString()).toBe("2026-07-04T21:30:00.000Z");
    expect(state.isPlaying).toBe(true);
    expect(state.speed).toBe(60);
    expect(state.motionOverride).toBe("reduce");
    expect(state.pulseId).toBe(0);
    expect(state.manualEvents).toEqual([]);
  });

  it("falls back to safe defaults for invalid optional parameters", () => {
    const state = parseRehearsalParams(
      "?keiko=1&at=not-a-date&speed=999&play=maybe&motion=nope",
      FALLBACK_NOW,
    );

    expect(state.enabled).toBe(true);
    expect(state.now).toBe(FALLBACK_NOW);
    expect(state.isPlaying).toBe(false);
    expect(state.speed).toBe(1);
    expect(state.motionOverride).toBe("system");
  });

  it("keeps the feature absent when keiko is not requested", () => {
    const state = parseRehearsalParams("?at=2026-07-05T06:30:00%2B09:00", FALLBACK_NOW);

    expect(state.enabled).toBe(false);
    expect(state.now).toBe(FALLBACK_NOW);
    expect(state.isPlaying).toBe(false);
  });
});

describe("advanceRehearsalTime", () => {
  it("moves the rehearsal clock by the requested amount of milliseconds", () => {
    const next = advanceRehearsalTime(FALLBACK_NOW, 60_000);

    expect(next.toISOString()).toBe("2026-07-04T15:01:00.000Z");
  });
});

describe("getRehearsalPlaybackDelta", () => {
  it("scales elapsed real time by the rehearsal speed", () => {
    expect(getRehearsalPlaybackDelta(2_000, 60)).toBe(120_000);
    expect(getRehearsalPlaybackDelta(2_000, 3600)).toBe(7_200_000);
  });
});

describe("getEffectiveReducedMotion", () => {
  it("resolves rehearsal motion overrides against the system preference", () => {
    expect(getEffectiveReducedMotion(true, "system")).toBe(true);
    expect(getEffectiveReducedMotion(false, "system")).toBe(false);
    expect(getEffectiveReducedMotion(false, "reduce")).toBe(true);
    expect(getEffectiveReducedMotion(true, "full")).toBe(false);
  });
});

describe("mergeMotionEvents", () => {
  it("deduplicates manual events while preserving existing order", () => {
    expect(
      mergeMotionEvents(["tick-second", "tick-minute"], ["tick-minute", "tick-hour"]),
    ).toEqual(["tick-second", "tick-minute", "tick-hour"]);
  });
});

describe("getRehearsalScenario", () => {
  it("returns representative dates and manual events for every rehearsal scenario", () => {
    expect(getRehearsalScenario("minute").manualEvents).toEqual(["tick-minute"]);
    expect(getRehearsalScenario("hour").manualEvents).toEqual([
      "tick-minute",
      "tick-hour",
    ]);
    expect(getRehearsalScenario("date").manualEvents).toContain("date-change");
    expect(getRehearsalScenario("solar-term").manualEvents).toEqual([
      "solar-term-change",
    ]);
    expect(getRehearsalScenario("micro-season").manualEvents).toEqual([
      "micro-season-change",
    ]);
    expect(getRehearsalScenario("moon").now.toISOString()).toBe(
      "2026-07-29T03:00:00.000Z",
    );
  });
});
