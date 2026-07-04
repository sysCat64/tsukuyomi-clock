import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { ClockState } from "../core/time";
import { pad2 } from "../core/time";

type FlipClockProps = {
  clock: ClockState;
  reducedMotion: boolean;
};

const SIDE_GEARS = [0, 1, 2, 3, 4];

export function FlipClock({ clock, reducedMotion }: FlipClockProps) {
  return (
    <section className="flip-clock" aria-label="パタパタ式デジタル時計">
      <span className="flip-mechanism-chain left" aria-hidden="true">
        {SIDE_GEARS.map((gear) => (
          <i key={gear} />
        ))}
      </span>
      <span className="flip-mechanism-chain right" aria-hidden="true">
        {SIDE_GEARS.map((gear) => (
          <i key={gear} />
        ))}
      </span>
      <svg className="flip-botanical-sprig left" viewBox="0 0 128 74" aria-hidden="true">
        <path className="sprig-stem" d="M 10 65 C 34 45 52 37 76 18" />
        <path className="sprig-stem thin" d="M 36 47 C 28 34 23 24 21 11" />
        <path className="sprig-stem thin" d="M 54 35 C 55 22 62 13 73 6" />
        <path className="sprig-leaf" d="M 39 44 C 26 42 17 35 12 23 C 27 24 36 31 39 44 Z" />
        <path className="sprig-leaf alt" d="M 66 25 C 76 12 88 8 101 11 C 93 25 80 31 66 25 Z" />
        <circle className="sprig-blossom" cx="82" cy="16" r="3" />
        <circle className="sprig-blossom" cx="94" cy="13" r="2.1" />
        <circle className="sprig-blossom vermilion" cx="107" cy="20" r="2.6" />
      </svg>
      <svg className="flip-botanical-sprig right" viewBox="0 0 128 74" aria-hidden="true">
        <path className="sprig-stem" d="M 118 65 C 94 43 76 35 52 18" />
        <path className="sprig-stem thin" d="M 92 46 C 101 32 106 21 108 9" />
        <path className="sprig-stem thin" d="M 70 31 C 69 20 63 12 54 5" />
        <path className="sprig-leaf" d="M 88 45 C 102 42 112 35 117 22 C 101 23 91 31 88 45 Z" />
        <path className="sprig-leaf alt" d="M 60 25 C 50 12 38 8 26 11 C 33 24 46 31 60 25 Z" />
        <circle className="sprig-blossom" cx="45" cy="16" r="3" />
        <circle className="sprig-blossom" cx="33" cy="13" r="2.1" />
        <circle className="sprig-blossom vermilion" cx="20" cy="20" r="2.6" />
      </svg>
      <span className="flip-vermilion-knot" aria-hidden="true" />
      <span className="flip-frame-labels" aria-hidden="true">
        <span>時</span>
        <span>分</span>
        <span>秒</span>
      </span>
      <span className="flip-rivets" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <i key={index} />
        ))}
      </span>
      <span className="flip-gear-stack left" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="flip-gear-stack right" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <FlipUnit value={pad2(clock.hours)} label="時" reducedMotion={reducedMotion} />
      <span className="flip-separator" aria-hidden="true">
        :
      </span>
      <FlipUnit value={pad2(clock.minutes)} label="分" reducedMotion={reducedMotion} />
      <span className="flip-separator" aria-hidden="true">
        :
      </span>
      <FlipUnit value={pad2(clock.seconds)} label="秒" reducedMotion={reducedMotion} />
    </section>
  );
}

function FlipUnit({
  value,
  label,
  reducedMotion,
}: {
  value: string;
  label: string;
  reducedMotion: boolean;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!ref.current || reducedMotion) {
      return;
    }

    gsap.fromTo(
      ref.current,
      { rotateX: -86, y: -4, opacity: 0.64, transformOrigin: "50% 100%" },
      { rotateX: 0, y: 0, opacity: 1, duration: 0.42, ease: "power3.out" },
    );
  }, [value, reducedMotion]);

  return (
    <span className="flip-unit" aria-label={`${value}${label}`}>
      <span ref={ref} className="flip-value">
        {value}
      </span>
      <span className="flip-label">{label}</span>
    </span>
  );
}
