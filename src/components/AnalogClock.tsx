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

export function AnalogClock({
  clock,
  astronomy,
  minutePulse,
  hourPulse,
  reducedMotion,
}: AnalogClockProps) {
  const gearRef = useRef<SVGGElement | null>(null);
  const windowRef = useRef<SVGGElement | null>(null);
  const sealRef = useRef<SVGTextElement | null>(null);
  const angles = getAnalogAngles(clock);
  const sunPathLength = Math.max(0.04, astronomy.daylightProgress);
  const moonOpacity = 0.25 + astronomy.moonIllumination * 0.55;

  useEffect(() => {
    if (!gearRef.current || reducedMotion) {
      return;
    }

    gsap.fromTo(
      gearRef.current,
      { rotate: -2, transformOrigin: "160px 160px", scale: 0.992 },
      {
        rotate: 18,
        scale: 1.016,
        duration: 1.1,
        ease: "sine.inOut",
      },
    );
  }, [minutePulse, reducedMotion]);

  useEffect(() => {
    if (!windowRef.current || !sealRef.current || reducedMotion) {
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
        </defs>

        <circle className="enso-shadow" cx="160" cy="160" r="129" />
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
        <circle
          className="sun-orb"
          cx={56 + 208 * astronomy.daylightProgress}
          cy={205 - Math.sin(Math.PI * astronomy.daylightProgress) * 128}
          r="5.2"
        />

        <g className="moon-window" opacity={moonOpacity}>
          <circle cx="238" cy="90" r="30" fill="url(#moon-glow)" />
          <path
            d="M 239 66 A 24 24 0 1 0 239 114 A 14 24 0 1 1 239 66"
            fill="#203c70"
          />
        </g>

        <g ref={gearRef} className="gear-ring">
          {Array.from({ length: 24 }, (_, index) => (
            <rect
              key={index}
              x="157.7"
              y="31"
              width="4.6"
              height={index % 2 === 0 ? 12 : 7}
              rx="1.6"
              transform={`rotate(${index * 15} 160 160)`}
            />
          ))}
          <circle cx="160" cy="160" r="8" />
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
