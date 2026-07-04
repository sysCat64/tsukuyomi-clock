import { useEffect, useMemo, useRef, useState } from "react";
import { getAlmanacState } from "../core/almanac";
import { getAstronomyState } from "../core/astronomy";
import type { LocationPreset } from "../core/locations";
import { getMotionEvents, type MotionEvent } from "../core/motion";
import { getClockState, type ClockState } from "../core/time";

export function useClockTicker(location: LocationPreset) {
  const [now, setNow] = useState(() => new Date());
  const previousClock = useRef<ClockState | null>(null);
  const previousSolarTerm = useRef<string | null>(null);
  const previousMicroSeason = useRef<string | null>(null);

  useEffect(() => {
    let timeoutId = window.setTimeout(function tick() {
      setNow(new Date());
      const nextDelay = 1000 - (Date.now() % 1000);
      timeoutId = window.setTimeout(tick, nextDelay);
    }, 1000 - (Date.now() % 1000));

    return () => window.clearTimeout(timeoutId);
  }, []);

  const clock = useMemo(() => getClockState(now), [now]);
  const almanac = useMemo(() => getAlmanacState(now), [now]);
  const astronomy = useMemo(() => getAstronomyState(now, location), [now, location]);

  const motionEvents = useMemo<MotionEvent[]>(() => {
    const events = getMotionEvents(
      previousClock.current,
      clock,
      previousSolarTerm.current,
      almanac.solarTerm,
      previousMicroSeason.current,
      almanac.microSeason,
    );

    previousClock.current = clock;
    previousSolarTerm.current = almanac.solarTerm;
    previousMicroSeason.current = almanac.microSeason;

    return events;
  }, [clock, almanac.solarTerm, almanac.microSeason]);

  return {
    now,
    clock,
    almanac,
    astronomy,
    motionEvents,
  };
}
