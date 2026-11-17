import { Droplet } from "lucide-react";

import { describeWeather } from "@/lib/weather/conditions";
import { dayLabel, formatTemp, shortDate } from "@/lib/weather/format";
import type { Forecast } from "@/lib/weather/types";

import { WeatherIcon } from "./WeatherIcon";

export function DailyForecast({ forecast }: { forecast: Forecast }) {
  const days = forecast.daily;
  const weekMin = Math.min(...days.map((d) => d.min));
  const weekMax = Math.max(...days.map((d) => d.max));
  const range = Math.max(1, weekMax - weekMin);

  return (
    <section aria-labelledby="proximos-dias" className="glass rounded-3xl p-5 shadow-glass">
      <h2 id="proximos-dias" className="font-display text-lg font-bold">
        Próximos 7 dias
      </h2>
      <ul className="mt-3 divide-y divide-border">
        {days.map((d, i) => {
          const condition = describeWeather(d.weatherCode, true);
          const left = ((d.min - weekMin) / range) * 100;
          const width = Math.max(4, ((d.max - d.min) / range) * 100);
          return (
            <li key={d.date} className="grid grid-cols-[5.5rem_2rem_1fr] items-center gap-3 py-3 sm:grid-cols-[6rem_2rem_1fr]">
              <div>
                <p className="font-semibold">{dayLabel(d.date, i)}</p>
                <p className="text-xs text-muted-foreground">{shortDate(d.date)}</p>
              </div>
              <WeatherIcon code={d.weatherCode} className="size-7" />
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="truncate">{condition.label}</span>
                  {d.precipitationProbability !== null ? (
                    <span className="flex shrink-0 items-center gap-0.5">
                      <Droplet className="size-3" aria-hidden />
                      <span className="sr-only">Chance de chuva</span>
                      {d.precipitationProbability}%
                    </span>
                  ) : null}
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-sm">
                  <span className="w-8 text-right text-muted-foreground">
                    <span className="sr-only">Mínima </span>
                    {formatTemp(d.min)}
                  </span>
                  <div className="relative h-1.5 flex-1 rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 rounded-full bg-temp-range"
                      style={{ left: `${left}%`, width: `${Math.min(width, 100 - left)}%` }}
                    />
                  </div>
                  <span className="w-8 font-semibold">
                    <span className="sr-only">Máxima </span>
                    {formatTemp(d.max)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
