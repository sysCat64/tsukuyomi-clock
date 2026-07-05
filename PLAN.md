# 「月読」墨暦からくり時計 設計書プラン

## Summary
- 作品名は **月読**、正式世界観名は **月読命**、副題は **墨暦からくり時計** とする。
- 日本限定のWebブラウザ時計として、`Asia/Tokyo` の暦、二十四節気、七十二候、月齢、太陽/月の位置を水墨画風のからくり演出に統合する。
- v1はバックエンドなしの静的フロントエンド。PCの現在時刻を入力源にし、日本の暦表示は東京基準、太陽/月の空位置は都市選択または任意のブラウザ現在地で計算する。
- デザイン思想は「墨 85%、余白 10%、色 5%」。朱、金、藍、薄紅、若草を意味のある瞬間だけ滲ませる。
- 現状はPhase 2で機構重視の画面polish、Phase 3で `?keiko=1` の隠し稽古パネル、Phase 4で静的成果物としてのREADME/QA/メタ情報整備を行った。Phase 5では、意味情報をHTML/SVGに残したまま、薄いラスタ素材で墨雲・山水・紙ムラ・月面・歯車影・円相筆致を補助する。

## Key Design And Implementation Changes
- 技術構成は `Vite + React + TypeScript + SVG + CSS + Canvas + GSAP + SunCalc + Astronomy Engine`。
- 役割分担は、Reactが画面構成、SVGが時計盤/針/歯車/小窓、Canvasが墨の滲み/霧/粒子、GSAPがからくり演出、SunCalcが日の出/日の入りと軽量な太陽/月位置、Astronomy Engineが月齢・太陽黄経・節気計算を担当する。
- `Three.js`、`D3.js`、`p5.js` は設計書の拡張候補に留め、v1依存には入れない。3D地球儀、星図、生成的な筆表現を追加する段階で採用する。
- 画面は掛け軸/屏風のような一画面アプリ。中央に墨の円相時計、下部または右側にパタパタ式時刻、左側に日付/和暦/曜日、余白に二十四節気・七十二候・月齢窓を配置する。
- Phase 2では、SVG時計に多層の墨円相、小歯車列、脱進機、月窓、太陽軌跡、落款を強め、Canvas背景に墨滲み、霧、粒子、筆筋を追加した。パネル類はカード感を抑え、和紙面と罫線を中心に整理した。
- Phase 5では、`src/assets/tsukuyomi-washi-landscape.png` を薄い背面レイヤーとして合成し、背景の墨雲、山水、枝、和紙のムラをラスタ素材で補助する。さらに `src/assets/tsukuyomi-enso-brush-overlay.png`、`src/assets/tsukuyomi-moon-surface-overlay.png`、`src/assets/tsukuyomi-gear-shadow-overlay.png` をSVG時計の装飾画像として合成し、円相の乾いた筆致、月窓の藍の面、機構影の密度を上げる。時計針、暦、都市操作、天体値などの意味情報と操作面は引き続きHTML/SVG/React stateで保持する。
- アニメーションは「秒針の連続運動」「分ごとの小歯車の呼吸」「毎時の小窓開閉」「日付切替の落款」「節気/候切替の墨滲み」を標準演出にする。Phase 3の稽古パネルから、分歯車、毎時小窓、日付落款、節気滲み、候滲み、月齢窓の代表シナリオを再現できる。
- 現在地取得は任意。Geolocation APIはHTTPSとユーザー許可が必要なので、初期値は東京、都市プリセットは東京/京都/札幌/金沢/奈良/那覇。現在地取得時も逆ジオコーディングはしない。
- `prefers-reduced-motion` を尊重し、低モーション時は秒針更新、滲み、扉演出を簡略化する。Canvasは装飾レイヤーに限定し、時刻/暦/状態テキストはHTMLまたはSVGにも保持する。

## Public Interfaces And Data Model
- `LocationPreset`: `{ id, labelJa, latitude, longitude, timezone: "Asia/Tokyo" }`
- `ClockState`: `{ now, hours, minutes, seconds, dateLabelJa, eraLabelJa, weekdayLabelJa }`
- `AlmanacState`: `{ solarTerm, microSeason, solarTermProgress, microSeasonProgress }`
- `AstronomyState`: `{ sunrise, sunset, sunAzimuth, sunAltitude, moonAzimuth, moonAltitude, moonPhase, moonAgeLabel }`
- `MotionEvent`: `tick-second | tick-minute | tick-hour | date-change | solar-term-change | micro-season-change`
- 日時の基準は `new Date()`。表示暦は `Asia/Tokyo` に固定し、天体計算は選択地点の緯度経度を使う。Geolocationの仕様前提はMDNのGeolocation APIに従う: [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)。
- 稽古パネルは表示/QA専用の内部UI。`?keiko=1` で有効化し、`at`、`speed`、`play`、`motion` のURLパラメータで固定時刻、再生速度、停止/再生、低モーション上書きを指定できる。通常URLではDOMにも表示しない。

## Test Plan
- 固定日時で、時針/分針/秒針角度、パタパタ表示、日付/曜日/和暦表示が期待値になることを単体テストする。
- 東京/京都/札幌/那覇で、日の出/日の入り、太陽高度、月齢表示が計算され、都市切替で表示が変わることをテストする。
- 二十四節気/七十二候は、境界日前後の固定日時でラベルと進捗が切り替わることをテストする。太陽黄経や月相計算の前提はAstronomy EngineのJS APIに合わせる: [Astronomy Engine JS docs](https://github.com/cosinekitty/astronomy/tree/master/source/js)。
- Geolocation未対応、許可拒否、タイムアウト時に東京プリセットへ戻ることをテストする。
- Browser QAでデスクトップ/モバイル表示を確認し、文字の重なり、Canvasの非表示時の可読性、低モーション設定、毎時演出の完走を確認する。
- `npm run check` で `typecheck`、`test`、`build` を一括確認する。詳細な手動QA手順は `docs/QA.md` に記録する。
- パフォーマンスは、アニメーションがメインスレッドを長時間塞がず、Canvas描画が必要時だけ更新されることを確認する。

## Assumptions And Defaults
- v1は日本語UIのみ。多言語化、世界都市対応、旧暦の厳密計算、3D地球儀、天気連携は含めない。
- 二十四節気は計算ベース、七十二候は日本語名データと計算された節気区間の3分割で扱う。厳密な公的暦データとの差異は設計書に注記する。
- 若冲そのものの模倣ではなく、「水墨、余白、細密な生命感、幻想性」に着想を得た独自ビジュアルとして設計する。
- アクセントカラーは朱を落款/現在時刻、金を太陽/特別な節気、藍を月/夜、薄紅と若草を候の季節演出に割り当てる。
