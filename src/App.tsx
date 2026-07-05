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
const ORBIT_BEADS = [0.16, 0.34, 0.52, 0.7, 0.88];
const SUN_RAYS = Array.from({ length: 18 }, (_, index) => index);

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
        <CompositionOrbit progress={astronomy.daylightProgress} />
        <CompositionGround />
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

function CompositionGround() {
  return (
    <svg
      className="composition-ground"
      viewBox="0 0 1280 680"
      aria-hidden="true"
      focusable="false"
    >
      <g className="ground-left">
        <path className="ground-ink-pool" d="M -28 612 C 48 578 116 590 194 626 C 105 665 30 662 -28 642 Z" />
        <path className="ground-branch" d="M 18 633 C 58 600 73 568 92 526" />
        <path className="ground-branch fine" d="M 54 600 C 38 582 28 560 24 536" />
        <path className="ground-branch fine" d="M 66 584 C 91 575 111 557 126 536" />
        <path className="ground-branch fine" d="M 82 552 C 64 538 54 521 49 502" />
        <circle className="ground-blossom" cx="25" cy="538" r="3.2" />
        <circle className="ground-blossom pale" cx="52" cy="514" r="2.6" />
        <circle className="ground-blossom" cx="126" cy="536" r="2.8" />
        <circle className="ground-blossom pale" cx="80" cy="548" r="2.2" />
      </g>
      <g className="ground-center">
        <path className="ground-center-wash" d="M 426 642 C 468 610 516 618 552 588 C 592 554 640 572 676 610 C 628 638 532 648 426 642 Z" />
        <path className="ground-reed" d="M 500 650 C 508 620 518 596 536 568" />
        <path className="ground-reed thin" d="M 520 654 C 526 624 540 601 560 580" />
        <path className="ground-reed" d="M 590 653 C 583 618 575 596 558 569" />
        <path className="ground-reed thin" d="M 610 650 C 618 622 632 599 654 581" />
        <path className="ground-leaf" d="M 528 599 C 503 594 485 581 475 558 C 501 562 521 575 528 599 Z" />
        <path className="ground-leaf alt" d="M 583 606 C 612 593 634 591 660 600 C 638 619 611 623 583 606 Z" />
        <circle className="ground-gold-fleck" cx="566" cy="576" r="2.1" />
        <circle className="ground-gold-fleck pale" cx="642" cy="590" r="1.5" />
      </g>
      <g className="ground-right">
        <path className="ground-mist" d="M 936 600 C 980 570 1026 580 1068 552 C 1114 522 1166 548 1214 586 C 1166 616 1040 624 936 600 Z" />
        <path className="ground-ridge" d="M 900 632 C 950 600 995 617 1044 588 C 1094 559 1130 577 1176 603 C 1212 624 1260 614 1308 588 L 1308 680 L 900 680 Z" />
        <path className="ground-ridge deep" d="M 980 650 C 1030 626 1090 636 1138 608 C 1188 580 1232 606 1288 632 L 1288 680 L 980 680 Z" />
        <path className="ground-dry" d="M 982 604 C 1012 589 1035 596 1060 578 M 1105 585 C 1134 567 1162 575 1190 596 M 1210 612 C 1238 596 1260 598 1288 586" />
        <g className="ground-bamboo">
          <path d="M 1076 642 C 1088 602 1099 566 1112 526" />
          <path d="M 1100 645 C 1104 607 1112 570 1124 534" />
          <path d="M 1082 593 C 1062 578 1046 559 1038 535" />
          <path d="M 1105 584 C 1128 562 1148 546 1172 536" />
          <path d="M 1092 618 C 1070 613 1050 602 1032 584" />
          <path d="M 1110 617 C 1136 611 1161 600 1182 582" />
        </g>
      </g>
      <path className="ground-horizon" d="M 128 642 C 342 617 540 626 760 647 C 918 662 1082 650 1222 626" />
    </svg>
  );
}

function CompositionOrbit({ progress }: { progress: number }) {
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const visualProgress = 0.2 + clampedProgress * 0.62;
  const sunX = 760 + visualProgress * 320;
  const sunY = 236 - Math.sin(Math.PI * visualProgress) * 202;

  return (
    <svg
      className="composition-orbit"
      viewBox="0 0 1280 680"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="composition-orbit-path primary"
        pathLength="1"
        strokeDasharray={`${Math.max(0.08, visualProgress)} 1`}
        d="M 456 282 C 650 26 1006 18 1168 284"
      />
      <path
        className="composition-orbit-path secondary"
        d="M 520 326 C 700 88 1014 83 1192 320"
      />
      <path
        className="composition-orbit-path trailing"
        d="M 806 31 C 1042 10 1230 190 1194 492"
      />
      {ORBIT_BEADS.map((point) => (
        <circle
          key={point}
          className="composition-orbit-bead"
          cx={456 + point * 712}
          cy={282 - Math.sin(Math.PI * point) * 254}
          r={point <= visualProgress ? 3.2 : 2}
          opacity={point <= visualProgress ? 0.86 : 0.32}
        />
      ))}
      <g className="composition-sun" transform={`translate(${sunX} ${sunY})`}>
        {SUN_RAYS.map((index) => (
          <line
            key={index}
            x1="0"
            y1="-17"
            x2="0"
            y2={index % 2 === 0 ? "-29" : "-24"}
            transform={`rotate(${index * 20})`}
          />
        ))}
        <circle className="composition-sun-orb" r="18" />
        <circle className="composition-sun-core" r="9" />
      </g>
    </svg>
  );
}
