import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CloudSun } from "lucide-react";

import { AirQualityCard } from "@/components/weather/AirQualityCard";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { Recommendations } from "@/components/weather/Recommendations";
import { SavedPlaces } from "@/components/weather/SavedPlaces";
import { SearchBar } from "@/components/weather/SearchBar";
import { SkyBackground } from "@/components/weather/SkyBackground";
import { StatCards } from "@/components/weather/StatCards";
import { SunArc } from "@/components/weather/SunArc";
import { UnitToggle } from "@/components/weather/UnitToggle";
import { WeatherError, WeatherSkeleton } from "@/components/weather/WeatherStates";
import { useSavedPlaces } from "@/hooks/use-saved-places";
import { UnitsProvider } from "@/hooks/use-units";
import { airQualityQueryOptions } from "@/lib/weather/air";
import { buildAdvice } from "@/lib/weather/advice";
import { forecastQueryOptions, friendlyErrorMessage } from "@/lib/weather/api";
import { describeWeather } from "@/lib/weather/conditions";
import { parseLocationSearch, placeFromSearch, placeToSearch } from "@/lib/weather/location";
import type { Place } from "@/lib/weather/types";

export const Route = createFileRoute("/")({
  validateSearch: parseLocationSearch,
  head: () => ({
    meta: [
      { title: "Clima Agora — Previsão do tempo em tempo real" },
      {
        name: "description",
        content:
          "Pesquise qualquer cidade do Brasil ou do mundo e veja temperatura, sensação térmica, umidade, vento, índice UV, nascer e pôr do sol, qualidade do ar e a previsão para as próximas horas e 7 dias.",
      },
      { property: "og:title", content: "Clima Agora — Previsão do tempo em tempo real" },
      {
        property: "og:description",
        content:
          "Temperatura, umidade, vento, índice UV, sol e qualidade do ar para qualquer cidade do mundo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeatherPage,
});

function WeatherPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const place = placeFromSearch(search);
  const saved = useSavedPlaces();
  const forecast = useQuery(forecastQueryOptions(place.latitude, place.longitude));
  // Separate request: if the air service fails, the weather below still shows.
  const air = useQuery(airQualityQueryOptions(place.latitude, place.longitude));

  const sky = forecast.data
    ? describeWeather(forecast.data.current.weatherCode, forecast.data.current.isDay).sky
    : "partly-day";

  const advice = forecast.data
    ? buildAdvice({
        temperature: forecast.data.current.temperature,
        apparentTemperature: forecast.data.current.apparentTemperature,
        humidity: forecast.data.current.humidity,
        windSpeed: forecast.data.current.windSpeed,
        precipitationProbability: forecast.data.daily[0]?.precipitationProbability ?? null,
        uvIndex: forecast.data.current.uvIndex,
        uvIndexMax: forecast.data.daily[0]?.uvIndexMax ?? null,
        aqi: air.data?.usAqi ?? null,
        isDay: forecast.data.current.isDay,
      })
    : [];

  function selectPlace(next: Place) {
    saved.addToHistory(next);
    void navigate({ search: placeToSearch(next) });
  }

  return (
    <UnitsProvider>
      <div className="relative min-h-screen text-foreground">
        <SkyBackground sky={sky} />

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-10 pt-5 sm:px-6 lg:pt-8">
          <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 pt-1.5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glass">
                  <CloudSun className="size-6" aria-hidden />
                </span>
                <div>
                  <p className="font-display text-xl font-extrabold leading-none tracking-tight">Clima Agora</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Previsão do tempo em tempo real</p>
                </div>
              </div>
              <UnitToggle className="md:hidden" />
            </div>
            <div className="flex w-full items-center gap-2 md:w-auto md:max-w-md">
              <SearchBar onSelect={selectPlace} className="min-w-0 flex-1" />
              <UnitToggle className="hidden shrink-0 md:inline-flex" />
            </div>
          </header>

          <SavedPlaces
            favorites={saved.favorites}
            history={saved.history}
            current={place}
            onSelect={selectPlace}
            onClearHistory={saved.clearHistory}
          />

          <main className="mt-6">
            {forecast.isPending ? (
              <WeatherSkeleton />
            ) : forecast.isError ? (
              <WeatherError
                message={friendlyErrorMessage(forecast.error)}
                onRetry={() => void forecast.refetch()}
                retrying={forecast.isFetching}
              />
            ) : (
              <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
                <div className="flex min-w-0 flex-col gap-6">
                  <CurrentWeather
                    place={place}
                    forecast={forecast.data}
                    fetchedAt={forecast.dataUpdatedAt}
                    isFavorite={saved.isFavorite(place)}
                    isRefreshing={forecast.isFetching}
                    onToggleFavorite={() => saved.toggleFavorite(place)}
                    onRefresh={() => void forecast.refetch()}
                  />
                  <StatCards forecast={forecast.data} />
                  <Recommendations advice={advice} />
                  <div className="grid gap-6 sm:grid-cols-2">
                    <SunArc forecast={forecast.data} />
                    <AirQualityCard air={air.data} />
                  </div>
                  <HourlyForecast forecast={forecast.data} />
                </div>
                <DailyForecast forecast={forecast.data} />
              </div>
            )}
          </main>

          <footer className="mt-10 text-center text-xs text-muted-foreground">
            Dados meteorológicos:{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
              Open-Meteo
            </a>
            {" · "}
            qualidade do ar:{" "}
            <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
              Open-Meteo Air Quality
            </a>
          </footer>
        </div>
      </div>
    </UnitsProvider>
  );
}
