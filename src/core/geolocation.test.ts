import { describe, expect, it } from "vitest";
import { GEOLOCATION_ERROR, getGeolocationFallbackStatus } from "./geolocation";

describe("getGeolocationFallbackStatus", () => {
  it("maps browser geolocation failures to Tokyo fallback messages", () => {
    expect(getGeolocationFallbackStatus(GEOLOCATION_ERROR.permissionDenied)).toContain(
      "拒否されました",
    );
    expect(getGeolocationFallbackStatus(GEOLOCATION_ERROR.positionUnavailable)).toContain(
      "取得できませんでした",
    );
    expect(getGeolocationFallbackStatus(GEOLOCATION_ERROR.timeout)).toContain(
      "タイムアウト",
    );
    expect(getGeolocationFallbackStatus(999)).toBe(
      "現在地取得に失敗しました。東京へ戻しました。",
    );
  });
});
