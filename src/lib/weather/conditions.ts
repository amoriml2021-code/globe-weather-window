export type Sky =
  | "clear-day"
  | "partly-day"
  | "night"
  | "overcast"
  | "rain"
  | "storm"
  | "snow"
  | "fog";

export type ConditionCategory =
  | "clear"
  | "partly"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm"
  | "unknown";

export type ConditionIcon =
  | "sun"
  | "moon"
  | "cloud-sun"
  | "cloud-moon"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm";

export type WeatherDescription = {
  label: string;
  category: ConditionCategory;
  icon: ConditionIcon;
  sky: Sky;
};

const CATEGORY_STYLE: Record<ConditionCategory, { icon: ConditionIcon; sky: Sky }> = {
  clear: { icon: "sun", sky: "clear-day" },
  partly: { icon: "cloud-sun", sky: "partly-day" },
  overcast: { icon: "cloud", sky: "overcast" },
  fog: { icon: "fog", sky: "fog" },
  drizzle: { icon: "drizzle", sky: "rain" },
  rain: { icon: "rain", sky: "rain" },
  snow: { icon: "snow", sky: "snow" },
  storm: { icon: "storm", sky: "storm" },
  unknown: { icon: "cloud", sky: "overcast" },
};

/** WMO weather interpretation codes used by Open-Meteo. */
const CODES: Record<number, { label: string; category: ConditionCategory }> = {
  0: { label: "Ensolarado", category: "clear" },
  1: { label: "Parcialmente nublado", category: "partly" },
  2: { label: "Parcialmente nublado", category: "partly" },
  3: { label: "Nublado", category: "overcast" },
  45: { label: "Neblina", category: "fog" },
  48: { label: "Neblina com geada", category: "fog" },
  51: { label: "Garoa fraca", category: "drizzle" },
  53: { label: "Garoa", category: "drizzle" },
  55: { label: "Garoa intensa", category: "drizzle" },
  56: { label: "Garoa congelante", category: "drizzle" },
  57: { label: "Garoa congelante", category: "drizzle" },
  61: { label: "Chuva fraca", category: "rain" },
  63: { label: "Chuva", category: "rain" },
  65: { label: "Chuva forte", category: "rain" },
  66: { label: "Chuva congelante", category: "rain" },
  67: { label: "Chuva congelante", category: "rain" },
  71: { label: "Neve fraca", category: "snow" },
  73: { label: "Neve", category: "snow" },
  75: { label: "Neve forte", category: "snow" },
  77: { label: "Grãos de neve", category: "snow" },
  80: { label: "Pancadas de chuva", category: "rain" },
  81: { label: "Pancadas de chuva", category: "rain" },
  82: { label: "Pancadas de chuva fortes", category: "rain" },
  85: { label: "Pancadas de neve", category: "snow" },
  86: { label: "Pancadas de neve fortes", category: "snow" },
  95: { label: "Tempestade", category: "storm" },
  96: { label: "Tempestade com granizo", category: "storm" },
  99: { label: "Tempestade com granizo", category: "storm" },
};

export function describeWeather(code: number, isDay = true): WeatherDescription {
  const entry = CODES[code] ?? { label: "Condição indisponível", category: "unknown" as const };
  const style = CATEGORY_STYLE[entry.category];

  if (!isDay && entry.category === "clear") {
    return { label: "Céu limpo", category: "clear", icon: "moon", sky: "night" };
  }
  if (!isDay && entry.category === "partly") {
    return { label: entry.label, category: "partly", icon: "cloud-moon", sky: "night" };
  }
  return { label: entry.label, category: entry.category, icon: style.icon, sky: style.sky };
}
