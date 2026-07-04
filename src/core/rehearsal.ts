import type { MotionEvent } from "./motion";

export type MotionOverride = "system" | "reduce" | "full";
export type RehearsalScenarioId =
  | "minute"
  | "hour"
  | "date"
  | "solar-term"
  | "micro-season"
  | "moon";
export type RehearsalSpeed = 1 | 60 | 3600;

export type RehearsalState = {
  enabled: boolean;
  now: Date;
  isPlaying: boolean;
  speed: RehearsalSpeed;
  motionOverride: MotionOverride;
  pulseId: number;
  manualEvents: MotionEvent[];
};

export type RehearsalScenario = {
  id: RehearsalScenarioId;
  label: string;
  now: Date;
  manualEvents: MotionEvent[];
};

const SPEEDS = new Set<RehearsalSpeed>([1, 60, 3600]);
const MOTION_OVERRIDES = new Set<MotionOverride>(["system", "reduce", "full"]);

const SCENARIOS: Record<RehearsalScenarioId, RehearsalScenario> = {
  minute: {
    id: "minute",
    label: "分歯車",
    now: new Date("2026-07-05T06:31:00+09:00"),
    manualEvents: ["tick-minute"],
  },
  hour: {
    id: "hour",
    label: "毎時小窓",
    now: new Date("2026-07-05T07:00:00+09:00"),
    manualEvents: ["tick-minute", "tick-hour"],
  },
  date: {
    id: "date",
    label: "日付落款",
    now: new Date("2026-07-06T00:00:00+09:00"),
    manualEvents: ["tick-minute", "tick-hour", "date-change"],
  },
  "solar-term": {
    id: "solar-term",
    label: "節気滲み",
    now: new Date("2026-07-08T06:00:00+09:00"),
    manualEvents: ["solar-term-change"],
  },
  "micro-season": {
    id: "micro-season",
    label: "候滲み",
    now: new Date("2026-07-12T06:00:00+09:00"),
    manualEvents: ["micro-season-change"],
  },
  moon: {
    id: "moon",
    label: "月齢窓",
    now: new Date("2026-07-29T12:00:00+09:00"),
    manualEvents: ["tick-hour"],
  },
};

export const REHEARSAL_SCENARIO_IDS: RehearsalScenarioId[] = [
  "minute",
  "hour",
  "date",
  "solar-term",
  "micro-season",
  "moon",
];

export function parseRehearsalParams(
  search: string,
  fallbackNow: Date,
): RehearsalState {
  const params = new URLSearchParams(search);
  const enabled = params.get("keiko") === "1";
  const parsedNow = parseDateParam(params.get("at"));

  return {
    enabled,
    now: enabled && parsedNow ? parsedNow : fallbackNow,
    isPlaying: enabled && params.get("play") === "1",
    speed: parseSpeed(params.get("speed")),
    motionOverride: parseMotionOverride(params.get("motion")),
    pulseId: 0,
    manualEvents: [],
  };
}

export function advanceRehearsalTime(date: Date, deltaMs: number): Date {
  return new Date(date.getTime() + deltaMs);
}

export function getRehearsalPlaybackDelta(
  elapsedMs: number,
  speed: RehearsalSpeed,
): number {
  return elapsedMs * speed;
}

export function getEffectiveReducedMotion(
  systemReducedMotion: boolean,
  motionOverride: MotionOverride,
): boolean {
  if (motionOverride === "reduce") {
    return true;
  }

  if (motionOverride === "full") {
    return false;
  }

  return systemReducedMotion;
}

export function mergeMotionEvents(
  events: MotionEvent[],
  manualEvents: MotionEvent[],
): MotionEvent[] {
  return [...new Set([...events, ...manualEvents])];
}

export function getRehearsalScenario(id: RehearsalScenarioId): RehearsalScenario {
  const scenario = SCENARIOS[id];

  return {
    ...scenario,
    now: new Date(scenario.now),
    manualEvents: [...scenario.manualEvents],
  };
}

function parseDateParam(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseSpeed(value: string | null): RehearsalSpeed {
  const speed = Number(value);
  return SPEEDS.has(speed as RehearsalSpeed) ? (speed as RehearsalSpeed) : 1;
}

function parseMotionOverride(value: string | null): MotionOverride {
  return MOTION_OVERRIDES.has(value as MotionOverride) ? (value as MotionOverride) : "system";
}
