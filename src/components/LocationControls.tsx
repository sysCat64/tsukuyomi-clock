import type { LocationPreset } from "../core/locations";
import { LOCATION_PRESETS } from "../core/locations";

type LocationControlsProps = {
  location: LocationPreset;
  status: string;
  isLocating: boolean;
  onPresetChange: (location: LocationPreset) => void;
  onUseCurrentLocation: () => void;
};

export function LocationControls({
  location,
  status,
  isLocating,
  onPresetChange,
  onUseCurrentLocation,
}: LocationControlsProps) {
  return (
    <section className="location-controls" aria-labelledby="location-title">
      <div>
        <p className="control-label" id="location-title">
          観測地
        </p>
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
      <button type="button" onClick={onUseCurrentLocation} disabled={isLocating}>
        <span aria-hidden="true">◎</span>
        {isLocating ? "測位中" : "現在地"}
      </button>
      <p className="location-status" aria-live="polite">
        {status}
      </p>
    </section>
  );
}
