import * as Astronomy from "astronomy-engine";
import SunCalc from "suncalc";
import type { LocationPreset } from "./locations";

export type AstronomyState = {
  sunrise: Date | null;
  sunset: Date | null;
  sunAzimuth: number;
  sunAltitude: number;
  moonAzimuth: number;
  moonAltitude: number;
  moonPhase: string;
  moonAgeLabel: string;
  moonAge: number;
  moonIllumination: number;
  daylightProgress: number;
};

const SYNODIC_MONTH_DAYS = 29.530588853;

export function getAstronomyState(
  date: Date,
  location: LocationPreset,
): AstronomyState {
  const times = SunCalc.getTimes(date, location.latitude, location.longitude);
  const sunPosition = SunCalc.getPosition(date, location.latitude, location.longitude);
  const moonPosition = SunCalc.getMoonPosition(date, location.latitude, location.longitude);
  const illumination = SunCalc.getMoonIllumination(date);
  const moonPhaseAngle = getMoonPhaseAngle(date);
  const moonAge = (moonPhaseAngle / 360) * SYNODIC_MONTH_DAYS;

  return {
    sunrise: validDateOrNull(times.sunrise),
    sunset: validDateOrNull(times.sunset),
    sunAzimuth: radiansToDegrees(sunPosition.azimuth),
    sunAltitude: radiansToDegrees(sunPosition.altitude),
    moonAzimuth: radiansToDegrees(moonPosition.azimuth),
    moonAltitude: radiansToDegrees(moonPosition.altitude),
    moonPhase: getMoonPhaseLabel(moonAge),
    moonAgeLabel: `${moonAge.toFixed(1)}夜`,
    moonAge,
    moonIllumination: illumination.fraction,
    daylightProgress: getDaylightProgress(date, times.sunrise, times.sunset),
  };
}

function getMoonPhaseAngle(date: Date): number {
  const moonPhase = (Astronomy as unknown as {
    MoonPhase?: (date: Date) => number;
  }).MoonPhase;

  if (typeof moonPhase === "function") {
    const angle = moonPhase(date);
    if (Number.isFinite(angle)) {
      return normalizeDegrees(angle);
    }
  }

  return SunCalc.getMoonIllumination(date).phase * 360;
}

function getMoonPhaseLabel(age: number): string {
  if (age < 1.2 || age > 28.4) return "新月";
  if (age < 6.8) return "三日月";
  if (age < 8.8) return "上弦";
  if (age < 13.8) return "十三夜";
  if (age < 16.8) return "満月";
  if (age < 22.2) return "居待月";
  if (age < 24.2) return "下弦";
  return "有明月";
}

function getDaylightProgress(date: Date, sunrise?: Date, sunset?: Date): number {
  if (!sunrise || !sunset || Number.isNaN(sunrise.getTime()) || Number.isNaN(sunset.getTime())) {
    return 0;
  }

  const duration = sunset.getTime() - sunrise.getTime();
  if (duration <= 0) {
    return 0;
  }

  return Math.min(1, Math.max(0, (date.getTime() - sunrise.getTime()) / duration));
}

function validDateOrNull(value?: Date): Date | null {
  return value && !Number.isNaN(value.getTime()) ? value : null;
}

function radiansToDegrees(radians: number): number {
  return normalizeDegrees((radians * 180) / Math.PI);
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}
