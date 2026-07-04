import { useMemo, useState } from "react";
import { AnalogClock } from "./components/AnalogClock";
import { FlipClock } from "./components/FlipClock";
import { InkCanvas } from "./components/InkCanvas";
import { AlmanacPanel, AstroPanel, DatePanel } from "./components/InfoPanels";
import { LocationControls } from "./components/LocationControls";
import { RehearsalPanel } from "./components/RehearsalPanel";
import { getGeolocationFallbackStatus } from "./core/geolocation";
import {
  makeBrowserLocation,
  TOKYO_LOCATION,
  type LocationPreset,
} from "./core/locations";
import type { MotionEvent } from "./core/motion";
import { getEffectiveReducedMotion } from "./core/rehearsal";
import { useClockTicker } from "./hooks/useClockTicker";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useRehearsal } from "./hooks/useRehearsal";

const EMPTY_MOTION_EVENTS: MotionEvent[] = [];

export default function App() {
  const systemReducedMotion = usePrefersReducedMotion();
  const rehearsal = useRehearsal();
  const [location, setLocation] = useState<LocationPreset>(TOKYO_LOCATION);
  const [locationStatus, setLocationStatus] = useState("東京を初期観測地にしています。");
  const [isLocating, setIsLocating] = useState(false);
  const effectiveReducedMotion = getEffectiveReducedMotion(
    systemReducedMotion,
    rehearsal.state.enabled ? rehearsal.state.motionOverride : "system",
  );
  const { clock, almanac, astronomy, motionEvents } = useClockTicker(location, {
    nowOverride: rehearsal.state.enabled ? rehearsal.state.now : null,
    manualEvents: rehearsal.state.enabled ? rehearsal.state.manualEvents : EMPTY_MOTION_EVENTS,
    manualPulseId: rehearsal.state.enabled ? rehearsal.state.pulseId : 0,
  });

  const pulseKeys = useMemo(
    () => ({
      minute: `${clock.isoDateTokyo}-${clock.hours}-${clock.minutes}-${rehearsal.state.pulseId}`,
      hour: `${clock.isoDateTokyo}-${clock.hours}-${rehearsal.state.pulseId}`,
      date: `${clock.isoDateTokyo}-${rehearsal.state.pulseId}`,
      almanac: `${almanac.solarTerm}-${almanac.microSeason}-${rehearsal.state.pulseId}`,
    }),
    [
      clock.isoDateTokyo,
      clock.hours,
      clock.minutes,
      almanac.solarTerm,
      almanac.microSeason,
      rehearsal.state.pulseId,
    ],
  );

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocation(TOKYO_LOCATION);
      setLocationStatus("このブラウザは現在地取得に未対応です。東京へ戻しました。");
      return;
    }

    setIsLocating(true);
    setLocationStatus("ブラウザの現在地許可を待っています。");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = makeBrowserLocation(
          position.coords.latitude,
          position.coords.longitude,
        );
        setLocation(nextLocation);
        setLocationStatus("現在地を観測地にしました。逆ジオコーディングは行いません。");
        setIsLocating(false);
      },
      (error) => {
        setLocation(TOKYO_LOCATION);
        setLocationStatus(getGeolocationFallbackStatus(error.code));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 10 * 60 * 1000,
      },
    );
  };

  const hasDatePulse = motionEvents.includes("date-change");
  const hasAlmanacPulse =
    motionEvents.includes("solar-term-change") || motionEvents.includes("micro-season-change");

  return (
    <main
      className="tsukuyomi-app"
      data-reduced-motion={effectiveReducedMotion ? "true" : "false"}
      data-rehearsal={rehearsal.state.enabled ? "true" : "false"}
      data-date-pulse={hasDatePulse ? pulseKeys.date : "idle"}
      data-almanac-pulse={hasAlmanacPulse ? pulseKeys.almanac : "idle"}
    >
      <InkCanvas
        reducedMotion={effectiveReducedMotion}
        moonIllumination={astronomy.moonIllumination}
      />
      <div className="paper-grain" aria-hidden="true" />
      <div className="scroll-frame">
        <div className="composition-wash" aria-hidden="true">
          <i className="wash-band clock-haze" />
          <i className="wash-band lower-haze" />
          <i className="wash-band side-haze" />
        </div>
        <div className="mechanism-rail" aria-hidden="true">
          {Array.from({ length: 7 }, (_, index) => (
            <i key={index} />
          ))}
        </div>
        <DatePanel clock={clock} />
        <AnalogClock
          clock={clock}
          astronomy={astronomy}
          minutePulse={pulseKeys.minute}
          hourPulse={pulseKeys.hour}
          reducedMotion={effectiveReducedMotion}
        />
        <div className="right-rail">
          <LocationControls
            location={location}
            status={locationStatus}
            isLocating={isLocating}
            onPresetChange={(nextLocation) => {
              setLocation(nextLocation);
              setLocationStatus(`${nextLocation.labelJa}を観測地にしました。`);
            }}
            onUseCurrentLocation={useCurrentLocation}
          />
          <AstroPanel astronomy={astronomy} location={location} />
        </div>
        <div className="lower-rail">
          <FlipClock clock={clock} reducedMotion={effectiveReducedMotion} />
          <AlmanacPanel almanac={almanac} />
        </div>
      </div>
      <RehearsalPanel state={rehearsal.state} actions={rehearsal.actions} />
      {/* v1 dependencies stay SVG/Canvas-native. Future candidates: Three.js for a 3D globe, D3.js for dense calendar charts, and p5.js for generative brush studies. */}
    </main>
  );
}
