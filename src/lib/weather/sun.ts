export type SunPhaseName = "before-sunrise" | "daytime" | "after-sunset";

export type SunPhase = {
  phase: SunPhaseName;
  /** 0 = sun at the horizon on the left, 1 = horizon on the right. */
  progress: number;
  daylightMinutes: number;
  /** Positive means it is still ahead of `nowLocal`. */
  minutesUntilSunrise: number;
  minutesUntilSunset: number;
};

/**
 * Minutes since an arbitrary epoch, computed from the wall-clock text so the
 * city's timezone never enters the math (Open-Meteo returns local time strings).
 */
function toMinutes(isoLocal: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(isoLocal);
  if (!match) return null;
  const [, y, m, d, h, min] = match;
  const days = Math.floor(Date.UTC(Number(y), Number(m) - 1, Number(d)) / 86400000);
  return days * 1440 + Number(h) * 60 + Number(min);
}

/** Where the sun sits between sunrise and sunset, from the city's local time. */
export function computeSunPhase(
  nowLocal: string,
  sunrise: string | null,
  sunset: string | null,
): SunPhase | null {
  const now = toMinutes(nowLocal);
  const up = sunrise ? toMinutes(sunrise) : null;
  const down = sunset ? toMinutes(sunset) : null;
  if (now === null || up === null || down === null) return null;

  const daylight = down - up;
  if (daylight <= 0) return null;

  const base = {
    daylightMinutes: daylight,
    minutesUntilSunrise: up - now,
    minutesUntilSunset: down - now,
  };

  if (now <= up) return { ...base, phase: "before-sunrise", progress: 0 };
  if (now >= down) return { ...base, phase: "after-sunset", progress: 1 };
  return { ...base, phase: "daytime", progress: (now - up) / daylight };
}

/** 798 → "13 h 18 min". */
export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "–";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** 95 → "1 h 35 min" · 8 → "8 min" · negative or NaN → "–". */
export function formatRemaining(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "–";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  return formatDuration(minutes);
}

export type UvLevel = { label: string; tone: "low" | "moderate" | "high" | "very-high" | "extreme" };

/** WHO UV index bands. Null when the value is missing. */
export function classifyUv(value: number | null): UvLevel | null {
  if (value === null || !Number.isFinite(value)) return null;
  if (value < 3) return { label: "Baixo", tone: "low" };
  if (value < 6) return { label: "Moderado", tone: "moderate" };
  if (value < 8) return { label: "Alto", tone: "high" };
  if (value < 11) return { label: "Muito alto", tone: "very-high" };
  return { label: "Extremo", tone: "extreme" };
}
