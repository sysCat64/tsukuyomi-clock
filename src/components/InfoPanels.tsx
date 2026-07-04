import type { AlmanacState } from "../core/almanac";
import type { AstronomyState } from "../core/astronomy";
import type { LocationPreset } from "../core/locations";
import type { ClockState } from "../core/time";
import { formatJstTime } from "../core/time";

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

export function DatePanel({ clock }: DatePanelProps) {
  return (
    <section className="date-panel" aria-labelledby="date-title">
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
      <div className="section-heading">
        <p>暦</p>
        <h2 id="almanac-title">二十四節気</h2>
      </div>
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
      <ProgressLine label="節気の歩み" value={almanac.solarTermProgress} />
      <ProgressLine label="候の滲み" value={almanac.microSeasonProgress} tone="green" />
    </section>
  );
}

export function AstroPanel({ astronomy, location }: AstroPanelProps) {
  return (
    <section className="astro-panel" aria-labelledby="astro-title">
      <div className="section-heading">
        <p>{location.labelJa}</p>
        <h2 id="astro-title">日月のからくり</h2>
      </div>
      <SkyDial astronomy={astronomy} />
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
  const moonPhaseX = 30 + astronomy.moonIllumination * 140;
  const moonPhaseY = 92 - Math.sin(Math.PI * astronomy.moonIllumination) * 28;

  return (
    <figure className="sky-dial" aria-label="太陽と月の軌道図">
      <svg viewBox="0 0 200 118" role="img" aria-label="太陽軌道と月の満ち欠け">
        <path className="sky-ground" d="M 22 97 C 54 82 84 91 112 84 C 142 76 164 82 180 96" />
        <path className="sky-sun-track" d="M 26 83 C 62 18 136 18 174 83" pathLength="1" />
        <path className="sky-moon-track" d="M 31 92 C 67 45 132 45 169 92" pathLength="1" />
        <circle className="sky-sun" cx={sunX} cy={sunY} r="6" />
        <circle className="sky-moon" cx={moonPhaseX} cy={moonPhaseY} r="6" />
        <text x="24" y="109">東</text>
        <text x="169" y="109">西</text>
        <text x="95" y="113">南</text>
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
