# 月読

**月読命 / 墨暦からくり時計** は、日本時間、日本の暦、太陽と月の位置を水墨画風のからくり時計として表示する静的フロントエンドアプリです。

English summary: Tsukuyomi is a Japanese ink-painting inspired astronomical karakuri clock for the browser.

## 作品概要

- 中央に墨の円相を思わせるアナログ時計を置き、時針、分針、秒針、歯車、小窓、月窓、太陽軌跡をSVGで描画します。
- 下段にパタパタ式デジタル時計、左に日付/和暦風ラベル/曜日、右に日の出、日の入り、太陽高度、月高度、月相、月齢を表示します。
- 二十四節気と七十二候は、Astronomy Engineの太陽黄経探索と節気区間の三分割によるv1近似です。
- Canvasは墨滲み、霧、粒子、筆筋の装飾レイヤーだけに使い、時刻や暦などの意味情報はHTML/SVGにも保持します。

## 技術構成

- Vite
- React
- TypeScript
- SVG
- CSS
- Canvas
- GSAP
- SunCalc
- Astronomy Engine

`Three.js`、`D3.js`、`p5.js` はv1依存には含めていません。将来の3D地球儀、星図、生成的な筆表現の候補として残しています。

## 起動方法

```bash
npm install
npm run dev -- --port 3000
```

Viteが指定ポートを使えない場合は、表示された代替URLを使ってください。

## 検証コマンド

```bash
npm run typecheck
npm test
npm run build
npm run check
```

`npm run check` は `typecheck`、`test`、`build` を一括で実行します。

## 表示URL

- 通常表示: `/`
- 稽古パネル: `/?keiko=1`
- 固定時刻と低モーション確認: `/?keiko=1&at=2026-07-05T06:30:00%2B09:00&speed=60&play=0&motion=reduce`

稽古パネルは制作/QA用の隠し機能です。`?keiko=1` がない通常表示ではDOMにも出しません。

## 稽古パネル

稽古パネルでは、以下をブラウザ上で再現できます。

- 現在へ戻す
- 再生/停止
- `±1秒`、`±1分`、`±1時間`、`±1日`
- 再生速度 `x1`、`x60`、`x3600`
- 低モーションの `端末設定`、`低モーション`、`演出全開`
- 分歯車、毎時小窓、日付落款、節気滲み、候滲み、月齢窓

## v1の範囲

バックエンド、ログイン、DB、天気API、多言語対応、世界都市対応、3D地球儀、厳密な公的旧暦計算は含めていません。
