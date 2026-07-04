import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { AstronomyState } from "../core/astronomy";
import type { ClockState } from "../core/time";
import { getAnalogAngles } from "../core/time";

type AnalogClockProps = {
  clock: ClockState;
  astronomy: AstronomyState;
  minutePulse: string;
  hourPulse: string;
  reducedMotion: boolean;
};

type GearSpec = {
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  className: string;
};

const GEARS: GearSpec[] = [
  { cx: 160, cy: 160, r: 34, teeth: 26, className: "main-gear" },
  { cx: 126, cy: 154, r: 22, teeth: 20, className: "shadow-gear" },
  { cx: 194, cy: 148, r: 19, teeth: 18, className: "shadow-gear" },
  { cx: 142, cy: 198, r: 17, teeth: 16, className: "small-gear" },
  { cx: 184, cy: 196, r: 24, teeth: 22, className: "shadow-gear" },
  { cx: 108, cy: 190, r: 13, teeth: 14, className: "small-gear" },
  { cx: 215, cy: 180, r: 12, teeth: 14, className: "small-gear" },
];

export function AnalogClock({
  clock,
  astronomy,
  minutePulse,
  hourPulse,
  reducedMotion,
}: AnalogClockProps) {
  const gearRef = useRef<SVGGElement | null>(null);
  const escapementRef = useRef<SVGGElement | null>(null);
  const windowRef = useRef<SVGGElement | null>(null);
  const moonGateRef = useRef<SVGGElement | null>(null);
  const sealRef = useRef<SVGTextElement | null>(null);
  const angles = getAnalogAngles(clock);
  const sunPathLength = Math.max(0.04, astronomy.daylightProgress);
  const moonOpacity = 0.25 + astronomy.moonIllumination * 0.55;

  useEffect(() => {
    if (!gearRef.current || reducedMotion) {
      return;
    }

    const timeline = gsap.timeline();
    timeline.fromTo(
      gearRef.current,
      { rotate: -4, transformOrigin: "160px 160px", scale: 0.988 },
      { rotate: 14, scale: 1.014, duration: 0.72, ease: "sine.inOut" },
    );

    if (escapementRef.current) {
      timeline.fromTo(
        escapementRef.current,
        { rotate: -7, transformOrigin: "160px 160px" },
        { rotate: 7, duration: 0.42, yoyo: true, repeat: 1, ease: "power2.inOut" },
        0,
      );
    }
  }, [minutePulse, reducedMotion]);

  useEffect(() => {
    if (!windowRef.current || !sealRef.current || !moonGateRef.current || reducedMotion) {
      return;
    }

    gsap
      .timeline()
      .fromTo(
        windowRef.current,
        { scaleX: 0.2, opacity: 0.4, transformOrigin: "160px 64px" },
        { scaleX: 1, opacity: 1, duration: 0.45, ease: "power2.out" },
      )
      .fromTo(
        sealRef.current,
        { y: 8, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
        "-=0.16",
      )
      .fromTo(
        moonGateRef.current,
        { rotate: -8, scale: 0.94, transformOrigin: "238px 90px" },
        { rotate: 0, scale: 1, duration: 0.55, ease: "back.out(1.7)" },
        "-=0.34",
      )
      .to(windowRef.current, {
        scaleX: 0.88,
        duration: 0.38,
        ease: "power2.inOut",
        delay: 0.5,
      });
  }, [hourPulse, reducedMotion]);

  return (
    <section className="clock-stage" aria-labelledby="analog-title">
      <h2 id="analog-title" className="sr-only">
        墨の円相アナログ時計
      </h2>
      <svg
        className="analog-clock"
        viewBox="0 0 320 320"
        role="img"
        aria-label={`${clock.timeLabel}、${clock.dateLabelJa} ${clock.weekdayLabelJa}`}
      >
        <defs>
          <filter id="ink-wobble">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018"
              numOctaves="3"
              seed="7"
            />
            <feDisplacementMap in="SourceGraphic" scale="2.6" />
          </filter>
          <linearGradient id="gold-line" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f0ca66" stopOpacity="0.1" />
            <stop offset="52%" stopColor="#d2a13b" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#f0ca66" stopOpacity="0.16" />
          </linearGradient>
          <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#90a7c9" stopOpacity="0.64" />
            <stop offset="100%" stopColor="#243f72" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="gear-smoke" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="#111" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#111" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle className="enso-shadow" cx="160" cy="160" r="129" />
        <circle className="dial-inner-wash" cx="160" cy="160" r="105" />
        <path
          className="enso-wash wash-one"
          d="M 83 72 C 122 34 190 28 238 69 C 279 104 297 171 267 225 C 234 282 153 302 91 264"
        />
        <path
          className="enso-wash wash-two"
          d="M 53 148 C 62 76 132 34 205 49 C 271 63 302 131 282 198 C 260 270 181 291 112 265 C 70 249 45 204 53 148 Z"
        />
        <path
          className="enso-wash wash-three"
          d="M 74 231 C 45 183 50 116 92 73 C 137 27 211 39 256 82"
        />
        <path
          className="enso-ring"
          filter="url(#ink-wobble)"
          d="M 160 35 C 231 35 284 87 286 158 C 288 228 234 283 160 284 C 86 285 34 231 35 160 C 36 88 88 36 160 35 Z"
        />
        <path
          className="enso-gap"
          d="M 69 78 C 91 54 121 40 157 38"
          pathLength="1"
        />

        <path
          className="sun-arc"
          d="M 56 205 C 95 79 224 79 264 205"
          pathLength="1"
          strokeDasharray={`${sunPathLength} 1`}
        />
        <path
          className="sun-arc ghost"
          d="M 63 218 C 112 105 214 96 273 192"
          pathLength="1"
        />
        <path
          className="sun-arc outer"
          d="M 183 43 C 248 19 297 63 292 137 C 289 179 272 211 246 235"
          pathLength="1"
        />
        {[0.14, 0.34, 0.58, 0.82].map((point) => (
          <circle
            key={point}
            className="sun-bead"
            cx={56 + 208 * point}
            cy={205 - Math.sin(Math.PI * point) * 128}
            r={point <= astronomy.daylightProgress ? 2.2 : 1.4}
            opacity={point <= astronomy.daylightProgress ? 0.88 : 0.32}
          />
        ))}
        <circle
          className="sun-orb"
          cx={56 + 208 * astronomy.daylightProgress}
          cy={205 - Math.sin(Math.PI * astronomy.daylightProgress) * 128}
          r="5.2"
        />

        <g ref={moonGateRef} className="moon-window" opacity={moonOpacity}>
          <circle cx="238" cy="90" r="30" fill="url(#moon-glow)" />
          <circle className="moon-frame" cx="238" cy="90" r="27" />
          <line className="moon-lattice" x1="220" y1="72" x2="220" y2="108" />
          <line className="moon-lattice" x1="228" y1="66" x2="228" y2="114" />
          <line className="moon-lattice" x1="247" y1="66" x2="247" y2="114" />
          <path
            d="M 239 66 A 24 24 0 1 0 239 114 A 14 24 0 1 1 239 66"
            fill="#203c70"
          />
        </g>

        <g ref={gearRef} className="gear-ring">
          <circle className="gear-smoke" cx="160" cy="166" r="76" fill="url(#gear-smoke)" />
          <path className="gear-bridge" d="M 96 170 C 126 136 189 137 224 168" />
          <path className="gear-bridge" d="M 119 207 C 145 183 180 183 207 207" />
          {GEARS.map((gear) => (
            <Gear key={`${gear.cx}-${gear.cy}`} spec={gear} />
          ))}
        </g>

        <g ref={escapementRef} className="escapement">
          <path d="M 141 131 L 160 160 L 179 131" />
          <circle cx="160" cy="160" r="11" />
          <line x1="160" y1="112" x2="160" y2="148" />
        </g>

        <g className="outer-teeth">
          {Array.from({ length: 36 }, (_, index) => (
            <rect
              key={index}
              x="158.6"
              y={index % 3 === 0 ? "24" : "29"}
              width="2.8"
              height={index % 3 === 0 ? 11 : 6}
              rx="1"
              transform={`rotate(${index * 10} 160 160)`}
            />
          ))}
        </g>

        <g className="cardinal-markers" aria-hidden="true">
          <text x="160" y="74" textAnchor="middle">
            十二
          </text>
          <text x="248" y="168" textAnchor="middle">
            三
          </text>
          <text x="160" y="262" textAnchor="middle">
            六
          </text>
          <text x="72" y="168" textAnchor="middle">
            九
          </text>
        </g>

        <g className="hour-marks">
          {Array.from({ length: 12 }, (_, index) => (
            <line
              key={index}
              x1="160"
              y1="49"
              x2="160"
              y2={index % 3 === 0 ? "68" : "61"}
              transform={`rotate(${index * 30} 160 160)`}
            />
          ))}
        </g>

        <g className="hands">
          <g transform={`rotate(${angles.hour} 160 160)`}>
            <line className="hand hour-hand" x1="160" y1="160" x2="160" y2="100" />
          </g>
          <g transform={`rotate(${angles.minute} 160 160)`}>
            <line className="hand minute-hand" x1="160" y1="160" x2="160" y2="67" />
          </g>
          <g transform={`rotate(${angles.second} 160 160)`}>
            <line className="hand second-hand" x1="160" y1="172" x2="160" y2="48" />
          </g>
          <circle className="hand-pin" cx="160" cy="160" r="6" />
        </g>

        <g ref={windowRef} className="karakuri-window">
          <path d="M 109 52 Q 160 33 211 52 L 203 76 Q 160 64 117 76 Z" />
          <text x="160" y="64" textAnchor="middle">
            月読命
          </text>
        </g>

        <text ref={sealRef} className="seal-mark" x="222" y="244">
          月読
        </text>
      </svg>
    </section>
  );
}

function Gear({ spec }: { spec: GearSpec }) {
  return (
    <g className={`clock-gear ${spec.className}`}>
      {Array.from({ length: spec.teeth }, (_, index) => (
        <rect
          key={index}
          x={spec.cx - 1.2}
          y={spec.cy - spec.r - 5}
          width="2.4"
          height="7"
          rx="0.7"
          transform={`rotate(${(360 / spec.teeth) * index} ${spec.cx} ${spec.cy})`}
        />
      ))}
      <circle cx={spec.cx} cy={spec.cy} r={spec.r} />
      <circle cx={spec.cx} cy={spec.cy} r={Math.max(3, spec.r * 0.24)} />
      <circle cx={spec.cx} cy={spec.cy} r={Math.max(1.8, spec.r * 0.08)} />
    </g>
  );
}
