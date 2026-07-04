export type ClockState = {
  now: Date;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  dateLabelJa: string;
  eraLabelJa: string;
  weekdayLabelJa: string;
  isoDateTokyo: string;
  timeLabel: string;
};

const TOKYO_TIME_ZONE = "Asia/Tokyo";
const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  weekday: "long",
  timeZone: TOKYO_TIME_ZONE,
});
const ERA_FORMATTER = new Intl.DateTimeFormat("ja-JP-u-ca-japanese", {
  era: "long",
  year: "numeric",
  timeZone: TOKYO_TIME_ZONE,
});
const DATE_PARTS_FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: TOKYO_TIME_ZONE,
});

type TokyoParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

export function getTokyoParts(date: Date): TokyoParts {
  const map = new Map(
    DATE_PARTS_FORMATTER.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return {
    year: Number(map.get("year")),
    month: Number(map.get("month")),
    day: Number(map.get("day")),
    hour: Number(map.get("hour")),
    minute: Number(map.get("minute")),
    second: Number(map.get("second")),
  };
}

export function getClockState(date = new Date()): ClockState {
  const parts = getTokyoParts(date);
  const dateLabelJa = `${parts.year}年${parts.month}月${parts.day}日`;
  const timeLabel = `${pad2(parts.hour)}:${pad2(parts.minute)}:${pad2(parts.second)}`;

  return {
    now: date,
    hours: parts.hour,
    minutes: parts.minute,
    seconds: parts.second,
    milliseconds: date.getMilliseconds(),
    dateLabelJa,
    eraLabelJa: `${ERA_FORMATTER.format(date)}の刻`,
    weekdayLabelJa: WEEKDAY_FORMATTER.format(date),
    isoDateTokyo: `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`,
    timeLabel,
  };
}

export function getAnalogAngles(clock: ClockState) {
  const secondProgress = clock.seconds + clock.milliseconds / 1000;
  const minuteProgress = clock.minutes + secondProgress / 60;
  const hourProgress = (clock.hours % 12) + minuteProgress / 60;

  return {
    hour: hourProgress * 30,
    minute: minuteProgress * 6,
    second: secondProgress * 6,
  };
}

export function formatJstTime(date?: Date | null): string {
  if (!date) {
    return "未定";
  }

  const parts = getTokyoParts(date);
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}
