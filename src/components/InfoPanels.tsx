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
      <p className="panel-kicker">月読</p>
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
