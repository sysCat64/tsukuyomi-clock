import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ensoBrushUrl from "../assets/tsukuyomi-enso-brush-overlay.png";
import gearShadowUrl from "../assets/tsukuyomi-gear-shadow-overlay.png";
import moonSurfaceUrl from "../assets/tsukuyomi-moon-surface-overlay.png";
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

type InkFleckSpec = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  rotate: number;
  opacity: number;
};

type InkBristleSpec = {
  d: string;
  className: string;
};

type MechanismThreadSpec = {
  d: string;
  className?: string;
};

type RivetSpec = {
  cx: number;
  cy: number;
  r: number;
  className?: string;
};

const GEARS: GearSpec[] = [
  { cx: 160, cy: 160, r: 34, teeth: 26, className: "main-gear" },
  { cx: 126, cy: 154, r: 22, teeth: 20, className: "shadow-gear" },
  { cx: 194, cy: 148, r: 19, teeth: 18, className: "shadow-gear" },
  { cx: 142, cy: 198, r: 17, teeth: 16, className: "small-gear" },
  { cx: 184, cy: 196, r: 24, teeth: 22, className: "shadow-gear" },
  { cx: 108, cy: 190, r: 13, teeth: 14, className: "small-gear" },
  { cx: 215, cy: 180, r: 12, teeth: 14, className: "small-gear" },
  { cx: 101, cy: 225, r: 15, teeth: 16, className: "small-gear deep-gear" },
  { cx: 128, cy: 235, r: 10, teeth: 12, className: "pinion-gear" },
  { cx: 222, cy: 250, r: 15, teeth: 16, className: "small-gear deep-gear" },
  { cx: 250, cy: 239, r: 10, teeth: 12, className: "pinion-gear" },
];

const MICRO_GEARS: GearSpec[] = [
  { cx: 92, cy: 164, r: 7, teeth: 10, className: "micro-gear" },
  { cx: 114, cy: 128, r: 8, teeth: 12, className: "micro-gear pale" },
  { cx: 205, cy: 124, r: 7, teeth: 10, className: "micro-gear pale" },
  { cx: 233, cy: 170, r: 7, teeth: 10, className: "micro-gear" },
  { cx: 149, cy: 222, r: 6, teeth: 10, className: "micro-gear pale" },
  { cx: 197, cy: 229, r: 6, teeth: 10, className: "micro-gear" },
];

const MECHANISM_THREADS: MechanismThreadSpec[] = [
  { d: "M 91 164 C 116 138 139 132 160 160" },
  { d: "M 115 128 C 138 115 176 114 206 124", className: "pale" },
  { d: "M 194 148 C 214 150 228 156 233 170" },
  { d: "M 128 235 C 146 224 178 222 198 229", className: "pale" },
  { d: "M 160 160 C 167 181 177 204 197 229" },
  { d: "M 108 190 C 123 208 137 217 150 222", className: "pale" },
];

const JEWEL_RIVETS: RivetSpec[] = [
  { cx: 118, cy: 119, r: 1.7 },
  { cx: 145, cy: 117, r: 1.25, className: "faint" },
  { cx: 184, cy: 118, r: 1.25, className: "faint" },
  { cx: 212, cy: 132, r: 1.65 },
  { cx: 93, cy: 177, r: 1.45, className: "faint" },
  { cx: 230, cy: 185, r: 1.45, className: "faint" },
  { cx: 143, cy: 217, r: 1.5 },
  { cx: 199, cy: 217, r: 1.5 },
];

const INK_FLECKS: InkFleckSpec[] = [
  { cx: 64, cy: 108, rx: 3.8, ry: 1.2, rotate: -23, opacity: 0.36 },
  { cx: 82, cy: 61, rx: 2.6, ry: 0.9, rotate: 18, opacity: 0.28 },
  { cx: 104, cy: 284, rx: 4.4, ry: 1.1, rotate: 11, opacity: 0.3 },
  { cx: 135, cy: 42, rx: 2, ry: 0.8, rotate: -7, opacity: 0.22 },
  { cx: 199, cy: 39, rx: 3.5, ry: 1.1, rotate: 36, opacity: 0.26 },
  { cx: 267, cy: 92, rx: 3.1, ry: 1, rotate: -28, opacity: 0.3 },
  { cx: 286, cy: 168, rx: 4.8, ry: 1.2, rotate: 70, opacity: 0.32 },
  { cx: 260, cy: 276, rx: 3.2, ry: 1, rotate: -18, opacity: 0.26 },
  { cx: 46, cy: 201, rx: 3.4, ry: 1, rotate: 62, opacity: 0.25 },
  { cx: 185, cy: 289, rx: 2.6, ry: 0.9, rotate: 6, opacity: 0.23 },
  { cx: 118, cy: 34, rx: 2.1, ry: 0.62, rotate: -18, opacity: 0.3 },
  { cx: 214, cy: 55, rx: 5.2, ry: 0.95, rotate: 15, opacity: 0.22 },
  { cx: 295, cy: 136, rx: 2.8, ry: 0.78, rotate: 61, opacity: 0.24 },
  { cx: 228, cy: 300, rx: 4.2, ry: 0.86, rotate: -8, opacity: 0.24 },
  { cx: 39, cy: 154, rx: 2.7, ry: 0.72, rotate: 77, opacity: 0.25 },
  { cx: 53, cy: 91, rx: 5.8, ry: 1.2, rotate: -31, opacity: 0.34 },
  { cx: 73, cy: 241, rx: 6.2, ry: 1.1, rotate: 22, opacity: 0.28 },
  { cx: 257, cy: 247, rx: 6.8, ry: 1.1, rotate: -26, opacity: 0.31 },
  { cx: 288, cy: 119, rx: 4.6, ry: 0.86, rotate: 60, opacity: 0.29 },
];

const INK_BRISTLES: InkBristleSpec[] = [
  {
    d: "M 65 83 C 112 40 190 32 242 70",
    className: "heavy",
  },
  {
    d: "M 48 151 C 53 91 102 48 164 42 C 210 38 250 59 275 95",
    className: "dry",
  },
  {
    d: "M 44 173 C 44 124 73 82 119 58",
    className: "dry pale",
  },
  {
    d: "M 266 101 C 291 146 284 211 245 252 C 204 294 132 292 79 252",
    className: "broken",
  },
  {
    d: "M 92 268 C 134 288 199 286 240 254",
    className: "dry tail",
  },
  {
    d: "M 95 49 C 133 28 191 25 228 45 C 247 55 262 68 274 87",
    className: "granular",
  },
  {
    d: "M 39 138 C 42 105 59 76 86 54 C 119 28 170 21 215 38",
    className: "granular pale",
  },
  {
    d: "M 273 116 C 292 161 286 214 253 254 C 230 282 194 296 151 296",
    className: "granular broken",
  },
  {
    d: "M 58 223 C 83 269 141 292 200 279",
    className: "granular tail",
  },
  {
    d: "M 72 74 C 115 35 184 28 236 56 C 265 72 283 98 291 129",
    className: "black-pool",
  },
  {
    d: "M 282 133 C 300 193 268 258 212 284 C 166 306 104 292 66 250",
    className: "black-pool broken",
  },
  {
    d: "M 45 178 C 40 139 50 104 76 74 C 112 33 172 22 226 39",
    className: "dry-scrape",
  },
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
  const sunX = 56 + 208 * astronomy.daylightProgress;
  const sunY = 205 - Math.sin(Math.PI * astronomy.daylightProgress) * 128;
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
          <clipPath id="moon-window-disc-clip">
            <circle cx="238" cy="90" r="24" />
          </clipPath>
          <clipPath id="moon-lens-disc-clip">
            <circle cx="235" cy="218" r="30" />
          </clipPath>
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
        <g className="enso-bristles" aria-hidden="true">
          {INK_BRISTLES.map((stroke) => (
            <path
              key={`${stroke.className}-${stroke.d}`}
              className={stroke.className}
              d={stroke.d}
            />
          ))}
        </g>
        <image
          className="raster-enso-brush"
          href={ensoBrushUrl}
          x="22"
          y="20"
          width="276"
          height="276"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        />
        <g className="enso-splatter" aria-hidden="true">
          {INK_FLECKS.map((fleck) => (
            <ellipse
              key={`${fleck.cx}-${fleck.cy}`}
              cx={fleck.cx}
              cy={fleck.cy}
              rx={fleck.rx}
              ry={fleck.ry}
              opacity={fleck.opacity}
              transform={`rotate(${fleck.rotate} ${fleck.cx} ${fleck.cy})`}
            />
          ))}
          <path d="M 50 124 C 58 122 63 126 69 124" />
          <path d="M 244 52 C 251 58 258 60 268 57" />
          <path d="M 72 252 C 82 258 91 260 102 257" />
        </g>

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
        <g className="sun-glyph" transform={`translate(${sunX} ${sunY})`}>
          {Array.from({ length: 12 }, (_, index) => (
            <line
              key={index}
              x1="0"
              y1="-7"
              x2="0"
              y2="-12"
              transform={`rotate(${index * 30})`}
            />
          ))}
          <circle className="sun-orb" r="5.2" />
          <circle className="sun-core" r="2.2" />
        </g>

        <g ref={moonGateRef} className="moon-window" opacity={moonOpacity}>
          <circle cx="238" cy="90" r="30" fill="url(#moon-glow)" />
          <circle className="moon-frame" cx="238" cy="90" r="27" />
          <path className="moon-window-paper" d="M 218 76 C 226 66 246 64 256 77 L 256 107 C 245 118 225 116 217 105 Z" />
          <image
            className="raster-moon-surface window"
            href={moonSurfaceUrl}
            x="214"
            y="66"
            width="48"
            height="48"
            clipPath="url(#moon-window-disc-clip)"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          />
          <line className="moon-lattice" x1="220" y1="72" x2="220" y2="108" />
          <line className="moon-lattice" x1="228" y1="66" x2="228" y2="114" />
          <line className="moon-lattice fine" x1="237" y1="64" x2="237" y2="116" />
          <line className="moon-lattice" x1="247" y1="66" x2="247" y2="114" />
          <line className="moon-lattice fine" x1="216" y1="88" x2="260" y2="88" />
          <line className="moon-lattice fine" x1="217" y1="101" x2="258" y2="101" />
          <path
            d="M 239 66 A 24 24 0 1 0 239 114 A 14 24 0 1 1 239 66"
            fill="#203c70"
          />
          <path className="moon-window-branch" d="M 222 109 C 230 98 240 96 251 100" />
          <path className="moon-window-branch fine" d="M 235 99 C 239 93 244 89 251 86" />
          <circle className="moon-window-blossom" cx="252" cy="100" r="1.8" />
          <circle className="moon-window-blossom pale" cx="252" cy="86" r="1.4" />
          <text className="moon-window-label" x="238" y="129" textAnchor="middle">
            月齢
          </text>
        </g>

        <g className="moon-lens" opacity={0.34 + astronomy.moonIllumination * 0.52}>
          <circle className="moon-lens-glow" cx="235" cy="218" r="38" />
          <circle className="moon-lens-frame" cx="235" cy="218" r="32" />
          <path
            className="moon-lens-disc"
            d="M 236 188 A 30 30 0 1 0 236 248 A 17 30 0 1 1 236 188"
          />
          <image
            className="raster-moon-surface lens"
            href={moonSurfaceUrl}
            x="205"
            y="188"
            width="60"
            height="60"
            clipPath="url(#moon-lens-disc-clip)"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          />
          <path className="moon-lens-haze" d="M 214 226 C 229 215 246 213 263 221" />
          <path className="moon-lens-branch" d="M 218 235 C 229 226 239 225 251 232" />
          <circle className="moon-lens-blossom" cx="252" cy="231" r="2.6" />
          <g className="moon-lens-ticks" aria-hidden="true">
            {Array.from({ length: 18 }, (_, index) => (
              <line
                key={index}
                x1="235"
                y1="183"
                x2="235"
                y2={index % 3 === 0 ? "190" : "187"}
                transform={`rotate(${index * 20} 235 218)`}
              />
            ))}
          </g>
        </g>

        <g ref={gearRef} className="gear-ring">
          <image
            className="raster-gear-shadow"
            href={gearShadowUrl}
            x="60"
            y="88"
            width="220"
            height="214"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          />
          <circle className="gear-smoke" cx="160" cy="166" r="76" fill="url(#gear-smoke)" />
          <g className="mechanism-plates" aria-hidden="true">
            <path d="M 82 214 C 110 188 132 190 158 207 L 151 236 C 121 244 96 237 82 214 Z" />
            <path d="M 177 212 C 208 191 238 197 262 222 C 244 246 205 254 181 239 Z" />
            <path d="M 106 141 C 126 118 188 118 214 140 L 205 153 C 180 140 138 140 116 154 Z" />
            {[
              [91, 215],
              [150, 223],
              [187, 223],
              [253, 223],
              [117, 143],
              [202, 143],
            ].map(([cx, cy]) => (
              <circle key={`${cx}-${cy}`} className="plate-rivet" cx={cx} cy={cy} r="2.2" />
            ))}
          </g>
          <path className="gear-bridge" d="M 96 170 C 126 136 189 137 224 168" />
          <path className="gear-bridge" d="M 119 207 C 145 183 180 183 207 207" />
          <path className="gear-bridge fine" d="M 95 226 C 144 248 206 250 254 224" />
          <path className="gear-bridge fine" d="M 91 198 C 130 223 189 224 227 197" />
          <g className="mechanism-threads" aria-hidden="true">
            {MECHANISM_THREADS.map((thread) => (
              <path
                key={`${thread.className ?? "thread"}-${thread.d}`}
                className={thread.className}
                d={thread.d}
              />
            ))}
          </g>
          {GEARS.map((gear) => (
            <Gear key={`${gear.cx}-${gear.cy}`} spec={gear} />
          ))}
          <g className="micro-gear-layer" aria-hidden="true">
            {MICRO_GEARS.map((gear) => (
              <Gear key={`${gear.cx}-${gear.cy}`} spec={gear} />
            ))}
          </g>
          <g className="jewel-rivets" aria-hidden="true">
            {JEWEL_RIVETS.map((rivet) => (
              <circle
                key={`${rivet.cx}-${rivet.cy}`}
                className={rivet.className}
                cx={rivet.cx}
                cy={rivet.cy}
                r={rivet.r}
              />
            ))}
          </g>
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
      {Array.from({ length: 6 }, (_, index) => (
        <line
          key={index}
          className="gear-spoke"
          x1={spec.cx}
          y1={spec.cy}
          x2={spec.cx}
          y2={spec.cy - spec.r * 0.76}
          transform={`rotate(${index * 60} ${spec.cx} ${spec.cy})`}
        />
      ))}
      <circle cx={spec.cx} cy={spec.cy} r={Math.max(3, spec.r * 0.24)} />
      <circle cx={spec.cx} cy={spec.cy} r={Math.max(1.8, spec.r * 0.08)} />
    </g>
  );
}
