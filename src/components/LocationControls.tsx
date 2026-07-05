import type { LocationPreset } from "../core/locations";
import { LOCATION_PRESETS } from "../core/locations";

type LocationControlsProps = {
  location: LocationPreset;
  status: string;
  isLocating: boolean;
  showAnalogSecondHand: boolean;
  onPresetChange: (location: LocationPreset) => void;
  onUseCurrentLocation: () => void;
  onShowAnalogSecondHandChange: (show: boolean) => void;
};

export function LocationControls({
  location,
  status,
  isLocating,
  showAnalogSecondHand,
  onPresetChange,
  onUseCurrentLocation,
  onShowAnalogSecondHandChange,
}: LocationControlsProps) {
  return (
    <section className="location-controls" aria-labelledby="location-title">
      <div className="location-select-wrap">
        <div className="location-heading-row">
          <p className="control-label" id="location-title">
            観測地
          </p>
          <label className="second-hand-toggle">
            <input
              type="checkbox"
              checked={showAnalogSecondHand}
              onChange={(event) => onShowAnalogSecondHandChange(event.target.checked)}
              aria-label="アナログ時計の秒針を表示"
            />
            <span>秒針</span>
          </label>
        </div>
        <label className="sr-only" htmlFor="location-select">
          日本の都市を選択
        </label>
        <select
          id="location-select"
          value={location.isCustom ? "browser-location" : location.id}
          onChange={(event) => {
            const next = LOCATION_PRESETS.find((preset) => preset.id === event.target.value);
            if (next) {
              onPresetChange(next);
            }
          }}
        >
          {LOCATION_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.labelJa}
            </option>
          ))}
          {location.isCustom ? <option value="browser-location">現在地</option> : null}
        </select>
      </div>
      <div className="preset-grid" aria-label="観測地プリセット">
        {LOCATION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="preset-chip"
            aria-pressed={!location.isCustom && location.id === preset.id}
            onClick={() => onPresetChange(preset)}
          >
            {preset.labelJa}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="locate-button"
        onClick={onUseCurrentLocation}
        disabled={isLocating}
      >
        <span aria-hidden="true">◎</span>
        {isLocating ? "測位中" : "現在地"}
      </button>
      <p className="location-status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
