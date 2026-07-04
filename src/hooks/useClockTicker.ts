import { useEffect, useMemo, useRef, useState } from "react";
import { getAlmanacState } from "../core/almanac";
import { getAstronomyState } from "../core/astronomy";
import type { LocationPreset } from "../core/locations";
import { getMotionEvents, type MotionEvent } from "../core/motion";
import { mergeMotionEvents } from "../core/rehearsal";
import { getClockState, type ClockState } from "../core/time";

type ClockTickerOptions = {
  nowOverride?: Date | null;
  manualEvents?: MotionEvent[];
  manualPulseId?: number;
};

export function useClockTicker(
  location: LocationPreset,
  {
    nowOverride = null,
    manualEvents = [],
    manualPulseId = 0,
  }: ClockTickerOptions = {},
) {
  const [now, setNow] = useState(() => new Date());
  const previousClock = useRef<ClockState | null>(null);
  const previousSolarTerm = useRef<string | null>(null);
  const previousMicroSeason = useRef<string | null>(null);
  const appliedManualPulseId = useRef(0);

  useEffect(() => {
    if (nowOverride) {
      return undefined;
    }

    let timeoutId = window.setTimeout(function tick() {
      setNow(new Date());
      const nextDelay = 1000 - (Date.now() % 1000);
      timeoutId = window.setTimeout(tick, nextDelay);
    }, 1000 - (Date.now() % 1000));

    return () => window.clearTimeout(timeoutId);
  }, [nowOverride]);

  const effectiveNow = nowOverride ?? now;
  const clock = useMemo(() => getClockState(effectiveNow), [effectiveNow]);
  const almanac = useMemo(() => getAlmanacState(effectiveNow), [effectiveNow]);
  const astronomy = useMemo(
    () => getAstronomyState(effectiveNow, location),
    [effectiveNow, location],
  );

  const motionEvents = useMemo<MotionEvent[]>(() => {
    let events = getMotionEvents(
      previousClock.current,
      clock,
      previousSolarTerm.current,
      almanac.solarTerm,
      previousMicroSeason.current,
      almanac.microSeason,
    );

    if (manualPulseId > 0 && appliedManualPulseId.current !== manualPulseId) {
      events = mergeMotionEvents(events, manualEvents);
      appliedManualPulseId.current = manualPulseId;
    }

    previousClock.current = clock;
    previousSolarTerm.current = almanac.solarTerm;
    previousMicroSeason.current = almanac.microSeason;

    return events;
  }, [clock, almanac.solarTerm, almanac.microSeason, manualEvents, manualPulseId]);

  return {
    now: effectiveNow,
    clock,
    almanac,
    astronomy,
    motionEvents,
  };
}
