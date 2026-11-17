import { ArrowDown, ArrowUp, Droplets, Navigation, Thermometer, Wind } from "lucide-react";
import type { ReactNode } from "react";

import { compassDirection, formatTemp } from "@/lib/weather/format";
import type { Forecast } from "@/lib/weather/types";

function StatCard({ icon, label, children, hint }: { icon: ReactNode; label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <div className="glass flex flex-col rounded-2xl p-4 shadow-glass">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </p>
      <div className="mt-3 font-display text-3xl font-bold">{children}</div>
      {hint ? <div className="mt-auto pt-2 text-xs text-muted-foreground">{hint}</div> : null}
    </div>
  );
}

export function StatCards({ forecast }: { forecast: Forecast }) {
  const { current } = forecast;
  const today = forecast.daily[0];
  const feelsDiff = Math.round(current.apparentTemperature - current.temperature);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard
        icon={<Thermometer className="size-4" aria-hidden />}
        label="Sensação"
        hint={feelsDiff === 0 ? "Igual à temperatura real" : feelsDiff > 0 ? `${feelsDiff}° mais quente` : `${Math.abs(feelsDiff)}° mais frio`}
      >
        {formatTemp(current.apparentTemperature)}
      </StatCard>

      <StatCard
        icon={<Droplets className="size-4" aria-hidden />}
        label="Umidade"
        hint={
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, current.humidity))}%` }} />
          </div>
        }
      >
        {Math.round(current.humidity)}%
      </StatCard>

      <StatCard
        icon={<Wind className="size-4" aria-hidden />}
        label="Vento"
        hint={
          <span className="flex items-center gap-1.5">
            <Navigation
              className="size-3.5"
              style={{ transform: `rotate(${current.windDirection + 180}deg)` }}
              aria-hidden
            />
            Direção {compassDirection(current.windDirection)}
          </span>
        }
      >
        {Math.round(current.windSpeed)}
        <span className="ml-1 text-base font-medium text-muted-foreground">km/h</span>
      </StatCard>

      <StatCard icon={<Thermometer className="size-4" aria-hidden />} label="Máx. / Mín." hint="Hoje">
        {today ? (
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-2xl lg:text-[1.65rem]">
            <span className="flex items-center">
              <ArrowUp className="size-4 text-warm" aria-label="Máxima" />
              {formatTemp(today.max)}
            </span>
            <span className="flex items-center text-muted-foreground">
              <ArrowDown className="size-4 text-cool" aria-label="Mínima" />
              {formatTemp(today.min)}
            </span>
          </span>
        ) : (
          "–"
        )}
      </StatCard>
    </div>
  );
}
