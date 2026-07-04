import * as Astronomy from "astronomy-engine";
import { getTokyoParts } from "./time";

export type AlmanacState = {
  solarTerm: string;
  microSeason: string;
  solarTermProgress: number;
  microSeasonProgress: number;
  nextSolarTerm: string;
  note: string;
};

type SolarTermDefinition = {
  name: string;
  longitude: number;
  approxMonth: number;
  approxDay: number;
  special?: boolean;
};

type SolarBoundary = SolarTermDefinition & {
  date: Date;
  index: number;
};

const SOLAR_TERMS: SolarTermDefinition[] = [
  { name: "小寒", longitude: 285, approxMonth: 1, approxDay: 5 },
  { name: "大寒", longitude: 300, approxMonth: 1, approxDay: 20 },
  { name: "立春", longitude: 315, approxMonth: 2, approxDay: 4, special: true },
  { name: "雨水", longitude: 330, approxMonth: 2, approxDay: 19 },
  { name: "啓蟄", longitude: 345, approxMonth: 3, approxDay: 5 },
  { name: "春分", longitude: 0, approxMonth: 3, approxDay: 20, special: true },
  { name: "清明", longitude: 15, approxMonth: 4, approxDay: 4 },
  { name: "穀雨", longitude: 30, approxMonth: 4, approxDay: 20 },
  { name: "立夏", longitude: 45, approxMonth: 5, approxDay: 5, special: true },
  { name: "小満", longitude: 60, approxMonth: 5, approxDay: 21 },
  { name: "芒種", longitude: 75, approxMonth: 6, approxDay: 5 },
  { name: "夏至", longitude: 90, approxMonth: 6, approxDay: 21, special: true },
  { name: "小暑", longitude: 105, approxMonth: 7, approxDay: 7 },
  { name: "大暑", longitude: 120, approxMonth: 7, approxDay: 22 },
  { name: "立秋", longitude: 135, approxMonth: 8, approxDay: 7, special: true },
  { name: "処暑", longitude: 150, approxMonth: 8, approxDay: 23 },
  { name: "白露", longitude: 165, approxMonth: 9, approxDay: 7 },
  { name: "秋分", longitude: 180, approxMonth: 9, approxDay: 23, special: true },
  { name: "寒露", longitude: 195, approxMonth: 10, approxDay: 8 },
  { name: "霜降", longitude: 210, approxMonth: 10, approxDay: 23 },
  { name: "立冬", longitude: 225, approxMonth: 11, approxDay: 7, special: true },
  { name: "小雪", longitude: 240, approxMonth: 11, approxDay: 22 },
  { name: "大雪", longitude: 255, approxMonth: 12, approxDay: 7 },
  { name: "冬至", longitude: 270, approxMonth: 12, approxDay: 21, special: true },
];

const MICRO_SEASONS = [
  "芹乃栄",
  "水泉動",
  "雉始雊",
  "款冬華",
  "水沢腹堅",
  "鶏始乳",
  "東風解凍",
  "黄鶯睍睆",
  "魚上氷",
  "土脉潤起",
  "霞始靆",
  "草木萌動",
  "蟄虫啓戸",
  "桃始笑",
  "菜虫化蝶",
  "雀始巣",
  "桜始開",
  "雷乃発声",
  "玄鳥至",
  "鴻雁北",
  "虹始見",
  "葭始生",
  "霜止出苗",
  "牡丹華",
  "蛙始鳴",
  "蚯蚓出",
  "竹笋生",
  "蚕起食桑",
  "紅花栄",
  "麦秋至",
  "螳螂生",
  "腐草為蛍",
  "梅子黄",
  "乃東枯",
  "菖蒲華",
  "半夏生",
  "温風至",
  "蓮始開",
  "鷹乃学習",
  "桐始結花",
  "土潤溽暑",
  "大雨時行",
  "涼風至",
  "寒蝉鳴",
  "蒙霧升降",
  "綿柎開",
  "天地始粛",
  "禾乃登",
  "草露白",
  "鶺鴒鳴",
  "玄鳥去",
  "雷乃収声",
  "蟄虫坏戸",
  "水始涸",
  "鴻雁来",
  "菊花開",
  "蟋蟀在戸",
  "霜始降",
  "霎時施",
  "楓蔦黄",
  "山茶始開",
  "地始凍",
  "金盞香",
  "虹蔵不見",
  "朔風払葉",
  "橘始黄",
  "閉塞成冬",
  "熊蟄穴",
  "鱖魚群",
  "乃東生",
  "麋角解",
  "雪下出麦",
];

const boundaryCache = new Map<number, SolarBoundary[]>();

export function getAlmanacState(date = new Date()): AlmanacState {
  const parts = getTokyoParts(date);
  const boundaries = [
    ...getSolarBoundaries(parts.year - 1),
    ...getSolarBoundaries(parts.year),
    ...getSolarBoundaries(parts.year + 1),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const currentIndex = Math.max(0, findCurrentBoundaryIndex(boundaries, date));
  const current = boundaries[currentIndex] ?? boundaries[0];
  const next = boundaries[currentIndex + 1] ?? boundaries[boundaries.length - 1];
  const termDuration = Math.max(1, next.date.getTime() - current.date.getTime());
  const elapsed = Math.max(0, date.getTime() - current.date.getTime());
  const solarTermProgress = clamp01(elapsed / termDuration);
  const microSeasonIndex = Math.min(2, Math.floor(solarTermProgress * 3));
  const microSeasonProgress = clamp01(solarTermProgress * 3 - microSeasonIndex);
  const microSeasonName =
    MICRO_SEASONS[(current.index % SOLAR_TERMS.length) * 3 + microSeasonIndex] ?? "候待ち";

  return {
    solarTerm: current.name,
    microSeason: microSeasonName,
    solarTermProgress,
    microSeasonProgress,
    nextSolarTerm: next.name,
    note: "節気はAstronomy Engineで太陽黄経境界を探索し、七十二候は各節気を三分割したv1近似です。",
  };
}

export function getSolarTermDefinitions(): readonly SolarTermDefinition[] {
  return SOLAR_TERMS;
}

function getSolarBoundaries(year: number): SolarBoundary[] {
  const cached = boundaryCache.get(year);
  if (cached) {
    return cached;
  }

  const boundaries = SOLAR_TERMS.map((definition, index) => ({
    ...definition,
    index,
    date: searchSolarLongitude(year, definition),
  }));

  boundaryCache.set(year, boundaries);
  return boundaries;
}

function findCurrentBoundaryIndex(boundaries: SolarBoundary[], date: Date): number {
  for (let index = boundaries.length - 1; index >= 0; index -= 1) {
    if (boundaries[index].date.getTime() <= date.getTime()) {
      return index;
    }
  }

  return 0;
}

function searchSolarLongitude(year: number, definition: SolarTermDefinition): Date {
  const approxUtc = Date.UTC(year, definition.approxMonth - 1, definition.approxDay, 0, 0, 0);
  const start = new Date(approxUtc - 7 * 24 * 60 * 60 * 1000);
  const searcher = (Astronomy as unknown as {
    SearchSunLongitude?: (longitude: number, start: Date, limitDays: number) => unknown;
  }).SearchSunLongitude;

  if (typeof searcher === "function") {
    const result = searcher(definition.longitude, start, 20);
    const date = unwrapAstronomyDate(result);
    if (date) {
      return date;
    }
  }

  return new Date(approxUtc);
}

function unwrapAstronomyDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return value;
  }

  if (value && typeof value === "object") {
    const maybe = value as {
      date?: unknown;
      toDate?: () => Date;
    };
    if (maybe.date instanceof Date) {
      return maybe.date;
    }
    if (typeof maybe.toDate === "function") {
      return maybe.toDate();
    }
  }

  return null;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}
