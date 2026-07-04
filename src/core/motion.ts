import type { ClockState } from "./time";

export type MotionEvent =
  | "tick-second"
  | "tick-minute"
  | "tick-hour"
  | "date-change"
  | "solar-term-change"
  | "micro-season-change";

export function getMotionEvents(
  previous: ClockState | null,
  current: ClockState,
  previousSolarTerm: string | null,
  currentSolarTerm: string,
  previousMicroSeason: string | null,
  currentMicroSeason: string,
): MotionEvent[] {
  const events: MotionEvent[] = ["tick-second"];

  if (!previous) {
    return events;
  }

  if (previous.minutes !== current.minutes) {
    events.push("tick-minute");
  }

  if (previous.hours !== current.hours) {
    events.push("tick-hour");
  }

  if (previous.isoDateTokyo !== current.isoDateTokyo) {
    events.push("date-change");
  }

  if (previousSolarTerm && previousSolarTerm !== currentSolarTerm) {
    events.push("solar-term-change");
  }

  if (previousMicroSeason && previousMicroSeason !== currentMicroSeason) {
    events.push("micro-season-change");
  }

  return events;
}
