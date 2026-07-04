import { useEffect, useMemo, useState } from "react";
import {
  advanceRehearsalTime,
  getRehearsalPlaybackDelta,
  getRehearsalScenario,
  parseRehearsalParams,
  type MotionOverride,
  type RehearsalScenarioId,
  type RehearsalSpeed,
  type RehearsalState,
} from "../core/rehearsal";

export type RehearsalActions = {
  resetToCurrent: () => void;
  setPlaying: (isPlaying: boolean) => void;
  shiftTime: (deltaMs: number) => void;
  setSpeed: (speed: RehearsalSpeed) => void;
  setMotionOverride: (motionOverride: MotionOverride) => void;
  runScenario: (scenarioId: RehearsalScenarioId) => void;
};

export function useRehearsal(): {
  state: RehearsalState;
  actions: RehearsalActions;
} {
  const [state, setState] = useState<RehearsalState>(() =>
    parseRehearsalParams(getCurrentSearch(), new Date()),
  );

  useEffect(() => {
    if (!state.enabled || !state.isPlaying) {
      return undefined;
    }

    let previousTick = Date.now();
    const intervalId = window.setInterval(() => {
      const currentTick = Date.now();
      const delta = getRehearsalPlaybackDelta(currentTick - previousTick, state.speed);
      previousTick = currentTick;

      setState((current) => ({
        ...current,
        now: advanceRehearsalTime(current.now, delta),
      }));
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [state.enabled, state.isPlaying, state.speed]);

  const actions = useMemo<RehearsalActions>(
    () => ({
      resetToCurrent: () => {
        setState((current) => ({
          ...current,
          now: new Date(),
          isPlaying: false,
          manualEvents: [],
          pulseId: current.pulseId + 1,
        }));
      },
      setPlaying: (isPlaying) => {
        setState((current) => ({
          ...current,
          isPlaying,
          manualEvents: [],
        }));
      },
      shiftTime: (deltaMs) => {
        setState((current) => ({
          ...current,
          now: advanceRehearsalTime(current.now, deltaMs),
          isPlaying: false,
          manualEvents: [],
          pulseId: current.pulseId + 1,
        }));
      },
      setSpeed: (speed) => {
        setState((current) => ({
          ...current,
          speed,
        }));
      },
      setMotionOverride: (motionOverride) => {
        setState((current) => ({
          ...current,
          motionOverride,
        }));
      },
      runScenario: (scenarioId) => {
        const scenario = getRehearsalScenario(scenarioId);
        setState((current) => ({
          ...current,
          now: scenario.now,
          isPlaying: false,
          manualEvents: scenario.manualEvents,
          pulseId: current.pulseId + 1,
        }));
      },
    }),
    [],
  );

  return { state, actions };
}

function getCurrentSearch(): string {
  return typeof window === "undefined" ? "" : window.location.search;
}
