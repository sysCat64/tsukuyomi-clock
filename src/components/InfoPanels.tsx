import type { AlmanacState } from "../core/almanac";
import type { AstronomyState } from "../core/astronomy";
import type { LocationPreset } from "../core/locations";
import type { ClockState } from "../core/time";
import { formatJstTime } from "../core/time";
import panelWashiUrl from "../assets/tsukuyomi-panel-washi-overlay.png";
import vermilionSealUrl from "../assets/tsukuyomi-vermilion-seal-overlay.png";

type DatePanelProps = {
  clock: ClockState;
};

type AlmanacPanelProps = {
  almanac: AlmanacState;
};

type AstroPanelProps = {
  astronomy: AstronomyState;
  location: LocationPreset;
};

const SKY_TICKS = Array.from({ length: 13 }, (_, index) => index / 12);
const ALTITUDE_GUIDES = [0.22, 0.46, 0.7];
const STAR_POINTS = [
  { x: 42, y: 34, r: 0.9 },
  { x: 58, y: 24, r: 0.72 },
  { x: 76, y: 31, r: 0.82 },
  { x: 128, y: 28, r: 0.76 },
  { x: 148, y: 38, r: 0.68 },
];

export function DatePanel({ clock }: DatePanelProps) {
  return (
    <section className="date-panel" aria-labelledby="date-title">
      <span className="date-ink-haze" aria-hidden="true" />
      <img className="date-panel-seal-raster" src={vermilionSealUrl} alt="" aria-hidden="true" />
      <svg className="date-botanical-scroll" viewBox="0 0 152 190" aria-hidden="true" focusable="false">
        <path className="date-branch main" d="M22 178 C28 136 36 104 56 70 C67 50 79 33 98 14" />
        <path className="date-branch dry" d="M45 98 C34 88 24 77 17 62" />
        <path className="date-branch dry" d="M53 78 C68 73 82 62 94 49" />
        <path className="date-branch pale" d="M34 138 C54 128 72 114 86 96" />
        <path className="date-branch pale" d="M28 154 C20 143 15 129 15 114" />
        <ellipse className="date-leaf leaf-a" cx="24" cy="73" rx="4.6" ry="11" transform="rotate(-35 24 73)" />
        <ellipse className="date-leaf leaf-b" cx="78" cy="60" rx="4.2" ry="12" transform="rotate(48 78 60)" />
        <ellipse className="date-leaf leaf-c" cx="62" cy="114" rx="3.8" ry="10" transform="rotate(55 62 114)" />
        <ellipse className="date-leaf leaf-d" cx="20" cy="130" rx="3" ry="8.5" transform="rotate(-28 20 130)" />
        <circle className="date-blossom blossom-a" cx="92" cy="44" r="2.3" />
        <circle className="date-blossom blossom-b" cx="17" cy="63" r="1.9" />
        <circle className="date-blossom blossom-c" cx="86" cy="96" r="1.7" />
        <g className="date-gear-signet" transform="translate(104 126)">
          <circle r="15" />
          <circle r="5.1" />
          {Array.from({ length: 12 }, (_, index) => (
            <line
              key={index}
              x1="0"
              y1="-18.2"
              x2="0"
              y2="-14.6"
              transform={`rotate(${index * 30})`}
            />
          ))}
        </g>
        <g className="date-vermilion-seals" transform="translate(112 148)">
          <rect x="0" y="0" width="18" height="18" rx="1.2" />
          <path d="M5 4 H13 M6 9 H12 M5 14 H13" />
          <rect x="13" y="22" width="15" height="15" rx="1" />
          <path d="M17 26 H24 M17 31 H23" />
        </g>
      </svg>
      <p className="panel-kicker">月読命</p>
      <h1 id="date-title">月読</h1>
      <p className="subtitle">墨暦からくり時計</p>
      <dl className="date-list">
        <div>
          <dt>今日</dt>
          <dd>{clock.dateLabelJa}</dd>
        </div>
        <div>
          <dt>和暦</dt>
          <dd>{clock.eraLabelJa}</dd>
        </div>
        <div>
          <dt>曜日</dt>
          <dd>{clock.weekdayLabelJa}</dd>
        </div>
      </dl>
    </section>
  );
}

export function AlmanacPanel({ almanac }: AlmanacPanelProps) {
  return (
    <section className="almanac-panel" aria-labelledby="almanac-title">
      <img className="panel-washi-raster almanac" src={panelWashiUrl} alt="" aria-hidden="true" />
      <img className="panel-seal-raster almanac" src={vermilionSealUrl} alt="" aria-hidden="true" />
      <div className="almanac-gold-seal" aria-hidden="true">
        {Array.from({ length: 16 }, (_, index) => (
          <i key={index} style={{ transform: `rotate(${index * 22.5}deg)` }} />
        ))}
      </div>
      <div className="section-heading">
        <p>暦</p>
        <h2 id="almanac-title">二十四節気</h2>
      </div>
      <div className="almanac-body">
        <dl className="metric-list">
          <div>
            <dt>いま</dt>
            <dd>{almanac.solarTerm}</dd>
          </div>
          <div>
            <dt>七十二候</dt>
            <dd>{almanac.microSeason}</dd>
          </div>
          <div>
            <dt>次候</dt>
            <dd>{almanac.nextSolarTerm}</dd>
          </div>
        </dl>
        <SeasonMotif progress={almanac.microSeasonProgress} />
      </div>
      <ProgressLine label="節気の歩み" value={almanac.solarTermProgress} />
      <ProgressLine label="候の滲み" value={almanac.microSeasonProgress} tone="green" />
    </section>
  );
}

export function AstroPanel({ astronomy, location }: AstroPanelProps) {
  return (
    <section className="astro-panel" aria-labelledby="astro-title">
      <img className="panel-washi-raster astro" src={panelWashiUrl} alt="" aria-hidden="true" />
      <img className="panel-seal-raster astro" src={vermilionSealUrl} alt="" aria-hidden="true" />
      <div className="section-heading">
        <p>{location.labelJa}</p>
        <h2 id="astro-title">日月のからくり</h2>
      </div>
      <SkyDial astronomy={astronomy} />
      <div className="celestial-signet-row" aria-hidden="true">
        <span className="sun-signet">
          {Array.from({ length: 12 }, (_, index) => (
            <i key={index} style={{ transform: `rotate(${index * 30}deg)` }} />
          ))}
        </span>
        <span className="moon-signet" />
      </div>
      <dl className="metric-grid">
        <div>
          <dt>日の出</dt>
          <dd>{formatJstTime(astronomy.sunrise)}</dd>
        </div>
        <div>
          <dt>日の入</dt>
          <dd>{formatJstTime(astronomy.sunset)}</dd>
        </div>
        <div>
          <dt>太陽高度</dt>
          <dd>{astronomy.sunAltitude.toFixed(1)}度</dd>
        </div>
        <div>
          <dt>月高度</dt>
          <dd>{astronomy.moonAltitude.toFixed(1)}度</dd>
        </div>
        <div>
          <dt>月相</dt>
          <dd>{astronomy.moonPhase}</dd>
        </div>
        <div>
          <dt>月齢</dt>
          <dd>{astronomy.moonAgeLabel}</dd>
        </div>
      </dl>
      <ProgressLine label="月の灯り" value={astronomy.moonIllumination} tone="indigo" />
    </section>
  );
}

function SkyDial({ astronomy }: { astronomy: AstronomyState }) {
  const sunX = 30 + astronomy.daylightProgress * 140;
  const sunY = 72 - Math.sin(Math.PI * astronomy.daylightProgress) * 42;
  const moonTrackProgress = normalizeSkyProgress(astronomy.moonAzimuth / 360);
  const moonX = 30 + moonTrackProgress * 140;
  const moonY = altitudeToSkyY(astronomy.moonAltitude);

  return (
    <figure
      className="sky-dial"
      aria-label={`太陽高度${astronomy.sunAltitude.toFixed(1)}度、月高度${astronomy.moonAltitude.toFixed(1)}度の軌道図`}
    >
      <svg viewBox="0 0 200 118" role="img" aria-label="太陽軌道と月の満ち欠け">
        <defs>
          <radialGradient id="sky-dial-wash" cx="52%" cy="74%" r="70%">
            <stop offset="0%" stopColor="rgba(16, 17, 18, 0.14)" />
            <stop offset="52%" stopColor="rgba(16, 17, 18, 0.04)" />
            <stop offset="100%" stopColor="rgba(16, 17, 18, 0)" />
          </radialGradient>
        </defs>
        <ellipse className="sky-dial-wash" cx="102" cy="86" rx="83" ry="24" />
        <g className="sky-mountain-mist" aria-hidden="true">
          <path className="sky-mist-band high" d="M 16 61 C 38 52 53 55 73 48 C 93 42 116 40 135 48 C 153 55 166 57 184 50" />
          <path className="sky-mist-band low" d="M 20 76 C 50 66 71 72 97 65 C 122 58 150 62 180 74" />
          <path className="sky-mountain pale" d="M 18 88 C 38 74 51 78 67 66 C 78 58 89 51 102 64 C 115 77 128 73 143 60 C 158 49 170 67 184 82 L 184 96 C 135 91 83 94 18 96 Z" />
          <path className="sky-mountain deep" d="M 24 94 C 43 84 61 87 79 77 C 94 68 112 69 128 80 C 145 91 163 84 181 94 C 135 105 70 106 24 94 Z" />
          <path className="sky-mountain dry" d="M 34 86 C 48 80 60 83 72 76 M 92 69 C 105 65 117 70 129 78 M 145 83 C 157 76 169 77 179 85" />
          <g className="sky-gold-beads">
            <circle cx="48" cy="80" r="1.2" />
            <circle cx="103" cy="66" r="1.1" />
            <circle cx="160" cy="78" r="1" />
          </g>
        </g>
        <path className="sky-horizon" d="M 20 91 H 182" />
        <path className="sky-meridian" d="M 100 91 C 99 65 100 40 101 16" />
        <g className="sky-altitude-guides" aria-hidden="true">
          {ALTITUDE_GUIDES.map((guide) => (
            <path
              key={guide}
              d={`M ${26 + guide * 24} ${91 - guide * 54} C ${66} ${
                44 - guide * 18
              } ${134} ${44 - guide * 18} ${174 - guide * 24} ${91 - guide * 54}`}
            />
          ))}
        </g>
        <g className="sky-track-ticks" aria-hidden="true">
          {SKY_TICKS.map((point) => {
            const x = 26 + point * 148;
            const y = 83 - Math.sin(Math.PI * point) * 65;
            return <line key={point} x1={x} y1={y - 2.2} x2={x} y2={y + 2.2} />;
          })}
        </g>
        <g className="sky-star-map" aria-hidden="true">
          <path d="M 42 34 L 58 24 L 76 31" />
          <path d="M 128 28 L 148 38" />
          {STAR_POINTS.map((point) => (
            <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={point.r} />
          ))}
        </g>
        <path className="sky-ground" d="M 22 97 C 54 82 84 91 112 84 C 142 76 164 82 180 96" />
        <path className="sky-ink-island" d="M 25 94 C 48 84 70 90 92 84 C 121 76 153 82 178 95 C 132 105 73 106 25 94 Z" />
        <path className="sky-reed left" d="M 42 93 C 39 84 37 77 35 68 M 44 94 C 44 84 47 76 51 68" />
        <path className="sky-reed right" d="M 153 92 C 154 82 157 75 164 67 M 158 94 C 163 85 169 80 176 76" />
        <path className="sky-tree" d="M 139 82 C 139 74 139 69 141 62 M 137 73 C 132 69 128 66 123 64 M 141 72 C 147 67 153 65 160 64" />
        <path className="sky-sun-track" d="M 26 83 C 62 18 136 18 174 83" pathLength="1" />
        <path className="sky-moon-track" d="M 31 92 C 67 45 132 45 169 92" pathLength="1" />
        <g className="sky-sun-glyph" transform={`translate(${sunX} ${sunY})`}>
          {Array.from({ length: 10 }, (_, index) => (
            <line
              key={index}
              x1="0"
              y1="-7"
              x2="0"
              y2="-11"
              transform={`rotate(${index * 36})`}
            />
          ))}
          <circle className="sky-sun" r="6" />
        </g>
        <g className="sky-moon-glyph" transform={`translate(${moonX} ${moonY})`}>
          <circle className="sky-moon" r="6" />
          <path d="M 1 -6 A 6 6 0 1 0 1 6 A 3.6 6 0 1 1 1 -6" />
        </g>
        <g className="sky-cardinal-ticks" aria-hidden="true">
          <line x1="30" y1="95" x2="30" y2="100" />
          <line x1="100" y1="93" x2="100" y2="101" />
          <line x1="170" y1="95" x2="170" y2="100" />
        </g>
        <text x="24" y="109">東</text>
        <text x="169" y="109">西</text>
        <text x="95" y="113">南</text>
      </svg>
    </figure>
  );
}

function altitudeToSkyY(altitude: number): number {
  const normalizedAltitude = Math.min(1, Math.max(0, (altitude + 10) / 90));
  return 92 - normalizedAltitude * 62;
}

function normalizeSkyProgress(value: number): number {
  return ((value % 1) + 1) % 1;
}

function SeasonMotif({ progress }: { progress: number }) {
  const goldOpacity = 0.34 + progress * 0.36;

  return (
    <figure className="season-motif" aria-hidden="true">
      <svg viewBox="0 0 120 108">
        <path className="season-ring" d="M 92 18 C 115 43 110 84 79 99 C 42 118 6 82 20 44 C 30 16 64 2 92 18 Z" />
        <path className="season-wash" d="M 16 89 C 31 73 54 74 71 61 C 89 48 98 30 104 14" />
        <path className="season-stem" d="M 38 90 C 52 67 65 47 74 20" />
        <path className="season-stem thin" d="M 52 94 C 62 74 82 62 94 42" />
        <path className="season-leaf" d="M 61 53 C 46 45 40 35 39 25 C 51 29 60 37 61 53 Z" />
        <path className="season-leaf alt" d="M 72 42 C 84 33 93 32 101 36 C 94 45 85 50 72 42 Z" />
        <path className="season-leaf pale" d="M 48 74 C 35 69 28 61 27 52 C 38 55 47 62 48 74 Z" />
        <g className="season-flecks" opacity={goldOpacity}>
          <circle cx="31" cy="31" r="1.8" />
          <circle cx="42" cy="22" r="1.2" />
          <circle cx="85" cy="25" r="1.4" />
          <circle cx="99" cy="57" r="1.1" />
          <circle cx="26" cy="75" r="1.2" />
        </g>
        <g className="season-seal">
          <rect x="84" y="82" width="14" height="14" />
          <path d="M 88 86 H 94 M 88 91 H 94 M 91 85 V 94" />
        </g>
      </svg>
    </figure>
  );
}

function ProgressLine({
  label,
  value,
  tone = "gold",
}: {
  label: string;
  value: number;
  tone?: "gold" | "indigo" | "green";
}) {
  const percent = `${Math.round(value * 100)}%`;

  return (
    <div className={`progress-line ${tone}`}>
      <span>{label}</span>
      <div className="progress-track" aria-hidden="true">
        <i style={{ inlineSize: percent }} />
      </div>
      <strong>{percent}</strong>
    </div>
  );
}
