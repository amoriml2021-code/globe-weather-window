import { Sunset, Sunrise } from "lucide-react";

import { formatLocalTime } from "@/lib/weather/format";
import { classifyUv, computeSunPhase, formatDuration, formatRemaining, type UvLevel } from "@/lib/weather/sun";
import type { Forecast } from "@/lib/weather/types";

const CX = 100;
const CY = 96;
const R = 88;
const ARC = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;

const UV_TEXT: Record<UvLevel["tone"], string> = {
  low: "text-aqi-good",
  moderate: "text-aqi-moderate",
  high: "text-aqi-sensitive",
  "very-high": "text-aqi-bad",
  extreme: "text-aqi-dangerous",
};

export function SunArc({ forecast }: { forecast: Forecast }) {
  const today = forecast.daily[0];
  const phase = today ? computeSunPhase(forecast.current.time, today.sunrise, today.sunset) : null;
  if (!today || !phase || !today.sunrise || !today.sunset) return null;

  const uv = classifyUv(forecast.current.uvIndex);

  const angle = Math.PI * phase.progress;
  const x = CX - R * Math.cos(angle);
  const y = CY - R * Math.sin(angle);
  const isDaytime = phase.phase === "daytime";

  const caption = isDaytime
    ? `Faltam ${formatRemaining(phase.minutesUntilSunset)} para o pôr do sol`
    : phase.phase === "before-sunrise"
      ? `Faltam ${formatRemaining(phase.minutesUntilSunrise)} para o sol nascer`
      : "O sol já se pôs — o arco recomeça amanhã";

  return (
    <section aria-labelledby="arco-solar" className="glass flex flex-col rounded-3xl p-5 shadow-glass">
      <h2 id="arco-solar" className="font-display text-lg font-bold">
        Sol de hoje
      </h2>

      <svg viewBox="0 0 200 112" className="mt-2 w-full" role="img" aria-label={caption}>
        <path d={ARC} fill="none" stroke="var(--border)" strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" />
        <path
          d={ARC}
          fill="none"
          stroke="var(--sun)"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray="100"
          strokeDashoffset={100 - phase.progress * 100}
        />
        <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke="var(--border)" strokeWidth="1" />
        <circle cx={x} cy={y} r={isDaytime ? 14 : 10} fill="var(--sun)" opacity="0.22" />
        <circle cx={x} cy={y} r={isDaytime ? 7 : 5} fill={isDaytime ? "var(--sun)" : "var(--cool)"} />
      </svg>

      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="flex items-center gap-1.5 text-sm">
          <Sunrise className="size-4 text-primary" aria-hidden />
          <span className="sr-only">Nascer do sol às </span>
          <span className="font-semibold">{formatLocalTime(today.sunrise)}</span>
        </p>
        <p className="text-center text-xs text-muted-foreground">{formatDuration(phase.daylightMinutes)} de sol</p>
        <p className="flex items-center gap-1.5 text-sm">
          <Sunset className="size-4 text-warm" aria-hidden />
          <span className="sr-only">Pôr do sol às </span>
          <span className="font-semibold">{formatLocalTime(today.sunset)}</span>
        </p>
      </div>

      <p className="mt-auto pt-3 text-xs text-muted-foreground">{caption}</p>

      {uv ? (
        <p className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2 text-xs">
          <span className="text-muted-foreground">Índice UV agora</span>
          <span className={`font-bold ${UV_TEXT[uv.tone]}`}>
            {Math.round(forecast.current.uvIndex ?? 0)} · {uv.label}
          </span>
        </p>
      ) : null}
    </section>
  );
}
