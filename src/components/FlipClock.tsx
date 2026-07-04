import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { ClockState } from "../core/time";
import { pad2 } from "../core/time";

type FlipClockProps = {
  clock: ClockState;
  reducedMotion: boolean;
};

export function FlipClock({ clock, reducedMotion }: FlipClockProps) {
  return (
    <section className="flip-clock" aria-label="パタパタ式デジタル時計">
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
