import { MapPin, RefreshCw, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { describeWeather } from "@/lib/weather/conditions";
import { formatLocalTime, formatTemp } from "@/lib/weather/format";
import { placeSubtitle } from "@/lib/weather/location";
import type { Forecast, Place } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

import { WeatherIcon } from "./WeatherIcon";

export function CurrentWeather({
  place,
  forecast,
  fetchedAt,
  isFavorite,
  isRefreshing,
  onToggleFavorite,
  onRefresh,
}: {
  place: Place;
  forecast: Forecast;
  fetchedAt: number;
  isFavorite: boolean;
  isRefreshing: boolean;
  onToggleFavorite: () => void;
  onRefresh: () => void;
}) {
  const { current } = forecast;
  const today = forecast.daily[0];
  const condition = describeWeather(current.weatherCode, current.isDay);
  const fetchedTime = new Date(fetchedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <section aria-labelledby="cidade-atual" className="glass rounded-3xl p-6 shadow-glass sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 id="cidade-atual" className="flex items-center gap-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            <MapPin className="size-6 shrink-0 text-primary" aria-hidden />
            <span className="truncate">{place.name}</span>
          </h1>
          <p className="mt-1 pl-8 text-sm text-muted-foreground">{placeSubtitle(place) || "—"}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            className="size-10 rounded-full"
          >
            <Star className={cn("!size-5", isFavorite && "fill-primary text-primary")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label="Atualizar informações"
            title="Atualizar informações"
            className="size-10 rounded-full"
          >
            <RefreshCw className={cn("!size-5", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
        <div>
          <p className="font-display text-[6.5rem] font-extrabold leading-[0.85] tracking-tighter sm:text-[8.5rem]">
            {formatTemp(current.temperature)}
            <span className="sr-only"> Celsius</span>
          </p>
          <p className="mt-3 text-xl font-semibold">{condition.label}</p>
          {today ? (
            <p className="mt-1 text-sm text-muted-foreground">
              Máx. {formatTemp(today.max)} · Mín. {formatTemp(today.min)}
            </p>
          ) : null}
        </div>
        <WeatherIcon
          code={current.weatherCode}
          isDay={current.isDay}
          strokeWidth={1.25}
          className="size-32 drop-shadow-lg sm:size-40"
        />
      </div>

      <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
        Dados das {formatLocalTime(current.time)} (horário local da cidade) · consultado às {fetchedTime}
      </p>
    </section>
  );
}
