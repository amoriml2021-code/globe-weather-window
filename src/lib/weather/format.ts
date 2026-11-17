const WEEKDAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const COMPASS = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatTemp(value: number): string {
  if (!Number.isFinite(value)) return "–";
  const rounded = Math.round(value);
  return `${rounded === 0 ? 0 : rounded}°`;
}

/** "2026-11-17T14:45" → "14:45" (Open-Meteo returns the city's local time). */
export function formatLocalTime(isoLocal: string): string {
  return isoLocal.slice(11, 16);
}

export function compassDirection(degrees: number): string {
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return COMPASS[index] ?? "N";
}

export function dayLabel(date: string, index: number): string {
  if (index === 0) return "Hoje";
  if (index === 1) return "Amanhã";
  const day = new Date(`${date}T12:00:00`).getDay();
  return WEEKDAYS[day] ?? date;
}

export function shortDate(date: string): string {
  const [, month, day] = date.split("-");
  return `${day}/${month}`;
}

/** Returns the forecast hours starting at the hour that contains `currentTime`. */
export function upcomingHours<T extends { time: string }>(
  hours: T[],
  currentTime: string,
  count: number,
): T[] {
  const currentHour = `${currentTime.slice(0, 13)}:00`;
  const start = hours.findIndex((h) => h.time >= currentHour);
  if (start === -1) return [];
  return hours.slice(start, start + count);
}

export type CityQueryResult = { ok: true; value: string } | { ok: false; message: string };

export function validateCityQuery(raw: string): CityQueryResult {
  const value = raw.trim().replace(/\s+/g, " ");
  if (!value) return { ok: false, message: "Digite o nome de uma cidade para pesquisar." };
  if (value.length < 2) return { ok: false, message: "Digite pelo menos 2 letras." };
  if (value.length > 80) return { ok: false, message: "Nome muito longo — use até 80 caracteres." };
  if (!/\p{L}/u.test(value)) return { ok: false, message: "O nome da cidade precisa ter letras." };
  return { ok: true, value };
}
