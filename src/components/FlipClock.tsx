import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import flipScuffUrl from "../assets/tsukuyomi-flip-scuff-overlay.png";
import type { ClockState } from "../core/time";
import { pad2 } from "../core/time";

type FlipClockProps = {
  clock: ClockState;
  reducedMotion: boolean;
};

type FlipGroupProps = {
  value: string;
  label: string;
  reducedMotion: boolean;
};

type FlipDigitProps = {
  value: string;
  reducedMotion: boolean;
};

const SIDE_GEARS = [0, 1, 2, 3, 4];
const CASE_RIVETS = Array.from({ length: 10 }, (_, index) => index);
const CORNER_PLATES = Array.from({ length: 4 }, (_, index) => index);

export function FlipClock({ clock, reducedMotion }: FlipClockProps) {
  return (
    <section className="flip-clock" aria-label="パタパタ式デジタル時計">
      <span className="flip-case-shadow" aria-hidden="true" />
      <img className="flip-scuff-raster" src={flipScuffUrl} alt="" aria-hidden="true" />
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
      <span className="flip-case-rail top" aria-hidden="true">
        {CASE_RIVETS.map((rivet) => (
          <i key={rivet} />
        ))}
      </span>
      <span className="flip-case-rail bottom" aria-hidden="true">
        {CASE_RIVETS.map((rivet) => (
          <i key={rivet} />
        ))}
      </span>
      <span className="flip-corner-plates" aria-hidden="true">
        {CORNER_PLATES.map((plate) => (
          <i key={plate} />
        ))}
      </span>
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
      <FlipGroup value={pad2(clock.hours)} label="時" reducedMotion={reducedMotion} />
      <span className="flip-separator" aria-hidden="true">
        :
      </span>
      <FlipGroup value={pad2(clock.minutes)} label="分" reducedMotion={reducedMotion} />
      <span className="flip-separator" aria-hidden="true">
        :
      </span>
      <FlipGroup value={pad2(clock.seconds)} label="秒" reducedMotion={reducedMotion} />
    </section>
  );
}

function FlipGroup({ value, label, reducedMotion }: FlipGroupProps) {
  const digits = value.split("");

  return (
    <span className="flip-unit" aria-label={`${value}${label}`}>
      <span className="flip-digit-row" aria-hidden="true">
        {digits.map((digit, index) => (
          <FlipDigit
            key={`${label}-${index}`}
            value={digit}
            reducedMotion={reducedMotion}
          />
        ))}
      </span>
      <span className="flip-label">{label}</span>
    </span>
  );
}

function FlipDigit({ value, reducedMotion }: FlipDigitProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);
  const [isFlipping, setIsFlipping] = useState(false);
  const digitRef = useRef<HTMLSpanElement | null>(null);
  const oldTopRef = useRef<HTMLSpanElement | null>(null);
  const oldBottomRef = useRef<HTMLSpanElement | null>(null);
  const newBottomRef = useRef<HTMLSpanElement | null>(null);
  const hingeShadowRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (value === displayValue) {
      if (reducedMotion && isFlipping) {
        setPreviousValue(value);
        setIsFlipping(false);
      }
      return;
    }

    if (reducedMotion) {
      setPreviousValue(value);
      setDisplayValue(value);
      setIsFlipping(false);
      return;
    }

    setPreviousValue(displayValue);
    setDisplayValue(value);
    setIsFlipping(true);
  }, [displayValue, isFlipping, reducedMotion, value]);

  useLayoutEffect(() => {
    if (
      !isFlipping ||
      reducedMotion ||
      !digitRef.current ||
      !oldTopRef.current ||
      !oldBottomRef.current ||
      !newBottomRef.current ||
      !hingeShadowRef.current
    ) {
      return;
    }

    const resetAnimatedParts = () => {
      gsap.set([oldTopRef.current, newBottomRef.current, hingeShadowRef.current], {
        clearProps: "opacity,transform,zIndex",
      });
      gsap.set(digitRef.current, { clearProps: "transform" });
    };

    const timeline = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        resetAnimatedParts();
        setPreviousValue(displayValue);
        setIsFlipping(false);
      },
    });

    gsap.set(digitRef.current, {
      transformOrigin: "50% 50%",
      transformPerspective: 760,
    });
    gsap.set(oldTopRef.current, {
      opacity: 1,
      rotateX: 0,
      transformOrigin: "50% 100%",
      transformPerspective: 760,
      zIndex: 6,
    });
    gsap.set(oldBottomRef.current, { opacity: 1, zIndex: 3 });
    gsap.set(newBottomRef.current, {
      opacity: 1,
      rotateX: 92,
      transformOrigin: "50% 0%",
      transformPerspective: 760,
      zIndex: 7,
    });
    gsap.set(hingeShadowRef.current, { opacity: 0, scaleY: 0.65 });

    timeline
      .to(digitRef.current, { y: -1.5, duration: 0.08, ease: "sine.out" }, 0)
      .to(
        hingeShadowRef.current,
        { opacity: 0.85, scaleY: 1, duration: 0.16, ease: "power1.out" },
        0,
      )
      .to(
        oldTopRef.current,
        { rotateX: -93, duration: 0.24, ease: "power3.in" },
        0.02,
      )
      .to(oldBottomRef.current, { opacity: 0, duration: 0.04 }, 0.22)
      .to(
        newBottomRef.current,
        { rotateX: 0, duration: 0.28, ease: "back.out(1.9)" },
        0.22,
      )
      .to(
        hingeShadowRef.current,
        { opacity: 0.18, scaleY: 0.5, duration: 0.2, ease: "sine.out" },
        0.34,
      )
      .to(digitRef.current, { y: 0, duration: 0.16, ease: "sine.out" }, 0.38);

    return () => {
      timeline.kill();
      resetAnimatedParts();
    };
  }, [displayValue, isFlipping, reducedMotion]);

  return (
    <span
      ref={digitRef}
      className="flip-digit"
      data-flipping={isFlipping ? "true" : "false"}
    >
      <span className="flip-card flip-card-top">
        <span className="flip-value">{displayValue}</span>
      </span>
      <span className="flip-card flip-card-bottom">
        <span className="flip-value">{displayValue}</span>
      </span>
      {isFlipping ? (
        <span ref={oldBottomRef} className="flip-card flip-card-bottom flip-card-old-bottom">
          <span className="flip-value">{previousValue}</span>
        </span>
      ) : null}
      <span ref={oldTopRef} className="flip-flap flip-flap-old-top">
        <span className="flip-value">{previousValue}</span>
      </span>
      <span ref={newBottomRef} className="flip-flap flip-flap-new-bottom">
        <span className="flip-value">{displayValue}</span>
      </span>
      <span ref={hingeShadowRef} className="flip-hinge-shadow" />
    </span>
  );
}
