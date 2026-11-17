import { queryOptions } from "@tanstack/react-query";

import { normalizeText } from "./format";
import type { DayPoint, Forecast, HourPoint, Place } from "./types";

const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

export class WeatherApiError extends Error {
  constructor(
    public readonly kind: "network" | "http" | "data",
    message: string,
  ) {
    super(message);
    this.name = "WeatherApiError";
  }
}

export function friendlyErrorMessage(error: unknown): string {
  if (error instanceof WeatherApiError) return error.message;
  return "Algo deu errado ao consultar o clima. Tente novamente em instantes.";
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, signal ? { signal } : undefined);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new WeatherApiError(
      "network",
      "Sem conexão com o serviço de meteorologia. Verifique sua internet e tente novamente.",
    );
  }
  if (!response.ok) {
    throw new WeatherApiError(
      "http",
      `O serviço de meteorologia está indisponível no momento (erro ${response.status}). Tente novamente em instantes.`,
    );
  }
  return (await response.json()) as T;
}

type RawPlace = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  country_code?: string;
  admin1?: string;
};

/**
 * Searches cities by name. Accepts an optional qualifier after a comma
 * ("Paris, França", "Campinas, SP") to narrow results by country or state.
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<Place[]> {
  const [namePart = "", ...rest] = query.split(",");
  const name = namePart.trim();
  const qualifier = normalizeText(rest.join(",").trim());
  if (name.length < 2) return [];

  const url = new URL(GEOCODING_URL);
  url.searchParams.set("name", name);
  url.searchParams.set("count", qualifier ? "20" : "8");
  url.searchParams.set("language", "pt");
  url.searchParams.set("format", "json");

  const data = await getJson<{ results?: RawPlace[] }>(url.toString(), signal);
  const places: Place[] = (data.results ?? []).map((r) => ({
    name: r.name,
    admin1: r.admin1,
    country: r.country,
    countryCode: r.country_code,
    latitude: r.latitude,
    longitude: r.longitude,
  }));

  if (!qualifier) return places;
  return places
    .filter((p) =>
      [p.country, p.admin1, p.countryCode].some(
        (field) => field && normalizeText(field).includes(qualifier),
      ),
    )
    .slice(0, 8);
}

type RawForecast = {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: (number | null)[];
    is_day: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
  };
};

export async function fetchForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<Forecast> {
  const url = new URL(FORECAST_URL);
  url.searchParams.set("latitude", latitude.toFixed(4));
  url.searchParams.set("longitude", longitude.toFixed(4));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m,wind_direction_10m",
  );
  url.searchParams.set("hourly", "temperature_2m,weather_code,precipitation_probability,is_day");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  );
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("wind_speed_unit", "kmh");

  const raw = await getJson<RawForecast>(url.toString(), signal);
  if (!raw.current || !raw.hourly || !raw.daily) {
    throw new WeatherApiError("data", "Os dados do clima vieram incompletos. Tente atualizar.");
  }

  const hourly: HourPoint[] = raw.hourly.time.map((time, i) => ({
    time,
    temperature: raw.hourly.temperature_2m[i] ?? Number.NaN,
    weatherCode: raw.hourly.weather_code[i] ?? -1,
    precipitationProbability: raw.hourly.precipitation_probability[i] ?? null,
    isDay: raw.hourly.is_day[i] === 1,
  }));

  const daily: DayPoint[] = raw.daily.time.map((date, i) => ({
    date,
    weatherCode: raw.daily.weather_code[i] ?? -1,
    max: raw.daily.temperature_2m_max[i] ?? Number.NaN,
    min: raw.daily.temperature_2m_min[i] ?? Number.NaN,
    precipitationProbability: raw.daily.precipitation_probability_max[i] ?? null,
  }));

  return {
    timezone: raw.timezone,
    current: {
      time: raw.current.time,
      temperature: raw.current.temperature_2m,
      apparentTemperature: raw.current.apparent_temperature,
      humidity: raw.current.relative_humidity_2m,
      windSpeed: raw.current.wind_speed_10m,
      windDirection: raw.current.wind_direction_10m,
      weatherCode: raw.current.weather_code,
      isDay: raw.current.is_day === 1,
    },
    hourly,
    daily,
  };
}

export const forecastQueryOptions = (latitude: number, longitude: number) =>
  queryOptions({
    queryKey: ["forecast", latitude.toFixed(3), longitude.toFixed(3)],
    queryFn: ({ signal }) => fetchForecast(latitude, longitude, signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const placesQueryOptions = (query: string) =>
  queryOptions({
    queryKey: ["places", normalizeText(query)],
    queryFn: ({ signal }) => searchPlaces(query, signal),
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
