import { queryOptions } from "@tanstack/react-query";

import { WeatherApiError, friendlyErrorMessage } from "./api";

const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";

export type AirQuality = {
  time: string;
  usAqi: number | null;
  europeanAqi: number | null;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  nitrogenDioxide: number | null;
};

export type AqiTone = "good" | "moderate" | "sensitive" | "bad" | "very-bad" | "dangerous";

export type AqiLevel = {
  label: string;
  tone: AqiTone;
  advice: string;
};

const LEVELS: { max: number; level: AqiLevel }[] = [
  { max: 50, level: { label: "Boa", tone: "good", advice: "Ar limpo, ótimo para atividades ao ar livre." } },
  { max: 100, level: { label: "Moderada", tone: "moderate", advice: "Qualidade aceitável para a maioria das pessoas." } },
  {
    max: 150,
    level: {
      label: "Ruim para grupos sensíveis",
      tone: "sensitive",
      advice: "Pessoas asmáticas, crianças e idosos devem reduzir o esforço ao ar livre.",
    },
  },
  { max: 200, level: { label: "Ruim", tone: "bad", advice: "Evite atividades prolongadas ao ar livre." } },
  {
    max: 300,
    level: { label: "Muito ruim", tone: "very-bad", advice: "Fique em casa o máximo que puder e feche as janelas." },
  },
  {
    max: Infinity,
    level: { label: "Perigosa", tone: "dangerous", advice: "Evite qualquer atividade ao ar livre." },
  },
];

/** US AQI scale — the one most weather apps use. Null when the value is missing. */
export function classifyAqi(value: number | null): AqiLevel | null {
  if (value === null || !Number.isFinite(value)) return null;
  const entry = LEVELS.find((l) => value <= l.max);
  return entry ? entry.level : null;
}

type RawAir = {
  current?: {
    time?: string;
    us_aqi?: number | null;
    european_aqi?: number | null;
    pm2_5?: number | null;
    pm10?: number | null;
    ozone?: number | null;
    nitrogen_dioxide?: number | null;
  };
};

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<AirQuality> {
  const url = new URL(AIR_URL);
  url.searchParams.set("latitude", latitude.toFixed(4));
  url.searchParams.set("longitude", longitude.toFixed(4));
  url.searchParams.set("current", "us_aqi,european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide");
  url.searchParams.set("timezone", "auto");

  let response: Response;
  try {
    response = await fetch(url.toString(), signal ? { signal } : undefined);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new WeatherApiError("network", "Sem conexão com o serviço de qualidade do ar.");
  }
  if (!response.ok) {
    throw new WeatherApiError("http", `O serviço de qualidade do ar está indisponível (erro ${response.status}).`);
  }

  const raw = (await response.json()) as RawAir;
  const current = raw.current;
  if (!current) throw new WeatherApiError("data", "Os dados de qualidade do ar vieram incompletos.");

  return {
    time: typeof current.time === "string" ? current.time : "",
    usAqi: toNumber(current.us_aqi),
    europeanAqi: toNumber(current.european_aqi),
    pm25: toNumber(current.pm2_5),
    pm10: toNumber(current.pm10),
    ozone: toNumber(current.ozone),
    nitrogenDioxide: toNumber(current.nitrogen_dioxide),
  };
}

/** Kept separate from the forecast so a failure here never hides the weather. */
export const airQualityQueryOptions = (latitude: number, longitude: number) =>
  queryOptions({
    queryKey: ["air-quality", latitude.toFixed(3), longitude.toFixed(3)],
    queryFn: ({ signal }) => fetchAirQuality(latitude, longitude, signal),
    staleTime: 10 * 60 * 1000,
    retry: 0,
  });

export { friendlyErrorMessage };
