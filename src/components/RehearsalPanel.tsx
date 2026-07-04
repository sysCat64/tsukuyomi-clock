import {
  getRehearsalScenario,
  REHEARSAL_SCENARIO_IDS,
  type MotionOverride,
  type RehearsalScenarioId,
  type RehearsalSpeed,
  type RehearsalState,
} from "../core/rehearsal";
import type { RehearsalActions } from "../hooks/useRehearsal";

type RehearsalPanelProps = {
  state: RehearsalState;
  actions: RehearsalActions;
};

const SPEED_OPTIONS: RehearsalSpeed[] = [1, 60, 3600];
const MOTION_OPTIONS: Array<{ value: MotionOverride; label: string }> = [
  { value: "system", label: "端末設定" },
  { value: "reduce", label: "低モーション" },
  { value: "full", label: "演出全開" },
];
const SHIFT_OPTIONS = [
  { label: "-1秒", deltaMs: -1000 },
  { label: "+1秒", deltaMs: 1000 },
  { label: "-1分", deltaMs: -60_000 },
  { label: "+1分", deltaMs: 60_000 },
  { label: "-1時間", deltaMs: -3_600_000 },
  { label: "+1時間", deltaMs: 3_600_000 },
  { label: "-1日", deltaMs: -86_400_000 },
  { label: "+1日", deltaMs: 86_400_000 },
];
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Asia/Tokyo",
});

export function RehearsalPanel({ state, actions }: RehearsalPanelProps) {
  if (!state.enabled) {
    return null;
  }

  return (
    <section className="rehearsal-panel" aria-label="演出稽古パネル">
      <div className="rehearsal-head">
        <p>稽古</p>
        <time dateTime={state.now.toISOString()}>
          {DATE_TIME_FORMATTER.format(state.now)}
        </time>
      </div>

      <div className="rehearsal-row rehearsal-primary">
        <button type="button" onClick={actions.resetToCurrent}>
          現在へ戻す
        </button>
        <button
          type="button"
          className="rehearsal-accent"
          onClick={() => actions.setPlaying(!state.isPlaying)}
        >
          {state.isPlaying ? "停止" : "再生"}
        </button>
      </div>

      <div className="rehearsal-row rehearsal-shifts" aria-label="時刻送り">
        {SHIFT_OPTIONS.map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => actions.shiftTime(option.deltaMs)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="rehearsal-row rehearsal-selects">
        <label>
          <span>速度</span>
          <select
            value={state.speed}
            onChange={(event) =>
              actions.setSpeed(Number(event.target.value) as RehearsalSpeed)
            }
          >
            {SPEED_OPTIONS.map((speed) => (
              <option key={speed} value={speed}>
                x{speed}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>動き</span>
          <select
            value={state.motionOverride}
            onChange={(event) =>
              actions.setMotionOverride(event.target.value as MotionOverride)
            }
          >
            {MOTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rehearsal-scenarios" aria-label="演出シナリオ">
        {REHEARSAL_SCENARIO_IDS.map((scenarioId) => (
          <ScenarioButton
            key={scenarioId}
            scenarioId={scenarioId}
            onRun={actions.runScenario}
          />
        ))}
      </div>
    </section>
  );
}

function ScenarioButton({
  scenarioId,
  onRun,
}: {
  scenarioId: RehearsalScenarioId;
  onRun: (scenarioId: RehearsalScenarioId) => void;
}) {
  const scenario = getRehearsalScenario(scenarioId);

  return (
    <button type="button" onClick={() => onRun(scenarioId)}>
      {scenario.label}
    </button>
  );
}
