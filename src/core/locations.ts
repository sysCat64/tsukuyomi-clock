export type LocationPreset = {
  id: string;
  labelJa: string;
  latitude: number;
  longitude: number;
  timezone: "Asia/Tokyo";
  isCustom?: boolean;
};

export const TOKYO_LOCATION: LocationPreset = {
  id: "tokyo",
  labelJa: "東京",
  latitude: 35.681236,
  longitude: 139.767125,
  timezone: "Asia/Tokyo",
};

export const LOCATION_PRESETS: LocationPreset[] = [
  TOKYO_LOCATION,
  {
    id: "sapporo",
    labelJa: "札幌",
    latitude: 43.061771,
    longitude: 141.354451,
    timezone: "Asia/Tokyo",
  },
  {
    id: "kanazawa",
    labelJa: "金沢",
    latitude: 36.561325,
    longitude: 136.656205,
    timezone: "Asia/Tokyo",
  },
  {
    id: "nara",
    labelJa: "奈良",
    latitude: 34.685087,
    longitude: 135.805,
    timezone: "Asia/Tokyo",
  },
  {
    id: "kyoto",
    labelJa: "京都",
    latitude: 35.011564,
    longitude: 135.768149,
    timezone: "Asia/Tokyo",
  },
  {
    id: "naha",
    labelJa: "那覇",
    latitude: 26.212401,
    longitude: 127.680932,
    timezone: "Asia/Tokyo",
  },
];

export const makeBrowserLocation = (
  latitude: number,
  longitude: number,
): LocationPreset => ({
  id: "browser-location",
  labelJa: "現在地",
  latitude,
  longitude,
  timezone: "Asia/Tokyo",
  isCustom: true,
});
