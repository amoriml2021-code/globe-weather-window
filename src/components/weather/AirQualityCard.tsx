import { Wind } from "lucide-react";

import { classifyAqi, type AirQuality, type AqiTone } from "@/lib/weather/air";
import { formatLocalTime } from "@/lib/weather/format";

const TONE_TEXT: Record<AqiTone, string> = {
  good: "text-aqi-good",
  moderate: "text-aqi-moderate",
  sensitive: "text-aqi-sensitive",
  bad: "text-aqi-bad",
  "very-bad": "text-aqi-very-bad",
  dangerous: "text-aqi-dangerous",
};

const TONE_BG: Record<AqiTone, string> = {
  good: "bg-aqi-good",
  moderate: "bg-aqi-moderate",
  sensitive: "bg-aqi-sensitive",
  bad: "bg-aqi-bad",
  "very-bad": "bg-aqi-very-bad",
  dangerous: "bg-aqi-dangerous",
};

const SCALE: AqiTone[] = ["good", "moderate", "sensitive", "bad", "very-bad", "dangerous"];

function Pollutant({ label, value }: { label: string; value: number | null }) {
  return (
    <li className="flex items-baseline justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">
        {value === null ? "–" : `${Math.round(value)}`}
        <span className="ml-1 text-[11px] font-normal text-muted-foreground">µg/m³</span>
      </span>
    </li>
  );
}

export function AirQualityCard({ air }: { air: AirQuality | undefined }) {
  const value = air ? (air.usAqi ?? air.europeanAqi) : null;
  const level = classifyAqi(value);
  if (!air || !level || value === null) return null;

  const marker = Math.min(100, Math.max(0, (value / 300) * 100));

  return (
    <section aria-labelledby="qualidade-ar" className="glass flex flex-col rounded-3xl p-5 shadow-glass">
      <h2 id="qualidade-ar" className="flex items-center gap-2 font-display text-lg font-bold">
        <Wind className="size-4 text-primary" aria-hidden />
        Qualidade do ar
      </h2>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="font-display text-4xl font-extrabold leading-none">{Math.round(value)}</span>
        <span className={`text-sm font-bold ${TONE_TEXT[level.tone]}`}>{level.label}</span>
      </div>

      <div className="relative mt-3 h-2">
        <div className="flex h-full overflow-hidden rounded-full">
          {SCALE.map((tone) => (
            <span key={tone} className={`h-full flex-1 ${TONE_BG[tone]}`} aria-hidden />
          ))}
        </div>
        <span
          className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground"
          style={{ left: `${marker}%` }}
          aria-hidden
        />
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{level.advice}</p>

      <ul className="mt-auto grid gap-1 pt-4 text-xs">
        <Pollutant label="PM2.5" value={air.pm25} />
        <Pollutant label="PM10" value={air.pm10} />
        <Pollutant label="Ozônio" value={air.ozone} />
      </ul>

      {air.time ? (
        <p className="mt-3 border-t border-border pt-2 text-[11px] text-muted-foreground">
          Medido às {formatLocalTime(air.time)} · índice dos EUA (AQI)
        </p>
      ) : null}
    </section>
  );
}
