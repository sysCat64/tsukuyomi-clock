export const GEOLOCATION_ERROR = {
  permissionDenied: 1,
  positionUnavailable: 2,
  timeout: 3,
} as const;

export function getGeolocationFallbackStatus(code: number): string {
  switch (code) {
    case GEOLOCATION_ERROR.permissionDenied:
      return "現在地取得が拒否されました。東京へ戻しました。";
    case GEOLOCATION_ERROR.positionUnavailable:
      return "現在地を取得できませんでした。東京へ戻しました。";
    case GEOLOCATION_ERROR.timeout:
      return "現在地取得がタイムアウトしました。東京へ戻しました。";
    default:
      return "現在地取得に失敗しました。東京へ戻しました。";
  }
}
