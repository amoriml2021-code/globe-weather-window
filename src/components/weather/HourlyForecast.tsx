import { Droplet } from "lucide-react";

import { useUnits } from "@/hooks/use-units";
import { formatLocalTime, upcomingHours } from "@/lib/weather/format";
import type { Forecast } from "@/lib/weather/types";

import { WeatherIcon } from "./WeatherIcon";

export function HourlyForecast({ forecast }: { forecast: Forecast }) {
  const { formatTemp } = useUnits();
  const hours = upcomingHours(forecast.hourly, forecast.current.time, 24);
  if (hours.length === 0) return null;

  return (
    <section aria-labelledby="proximas-horas" className="glass rounded-3xl p-5 shadow-glass">
      <h2 id="proximas-horas" className="font-display text-lg font-bold">
        Próximas 24 horas
      </h2>
      <ol className="scrollbar-thin -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-2">
        {hours.map((h, i) => (
          <li
            key={h.time}
            className="flex min-w-[4.5rem] flex-col items-center gap-2 rounded-2xl bg-muted px-3 py-3 first:bg-accent"
          >
            <span className="text-xs font-semibold text-muted-foreground">
              {i === 0 ? "Agora" : formatLocalTime(h.time)}
            </span>
            <WeatherIconSmall code={h.weatherCode} isDay={h.isDay} />
            <span className="font-display text-lg font-bold">{formatTemp(h.temperature)}</span>
            <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
              <Droplet className="size-3" aria-hidden />
              <span className="sr-only">Chance de chuva</span>
              {h.precipitationProbability ?? 0}%
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WeatherIconSmall({ code, isDay }: { code: number; isDay: boolean }) {
  return <WeatherIcon code={code} isDay={isDay} className="size-7" />;
}
