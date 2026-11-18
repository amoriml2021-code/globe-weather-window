/** Unit system: metric = °C + km/h, imperial = °F + mph. */
export type UnitSystem = "metric" | "imperial";

export const DEFAULT_UNIT_SYSTEM: UnitSystem = "metric";

export function isUnitSystem(value: unknown): value is UnitSystem {
  return value === "metric" || value === "imperial";
}

export function tempSuffix(system: UnitSystem): string {
  return system === "metric" ? "°C" : "°F";
}

export function speedSuffix(system: UnitSystem): string {
  return system === "metric" ? "km/h" : "mph";
}

/** Open-Meteo always returns Celsius; convert for display. */
export function convertTemp(celsius: number, system: UnitSystem): number {
  if (!Number.isFinite(celsius)) return Number.NaN;
  return system === "metric" ? celsius : (celsius * 9) / 5 + 32;
}

/** A difference of degrees is not the same as a temperature: no +32 offset. */
export function convertTempDelta(deltaCelsius: number, system: UnitSystem): number {
  if (!Number.isFinite(deltaCelsius)) return Number.NaN;
  return system === "metric" ? deltaCelsius : (deltaCelsius * 9) / 5;
}

/** Open-Meteo always returns km/h. */
export function convertSpeed(kmh: number, system: UnitSystem): number {
  if (!Number.isFinite(kmh)) return Number.NaN;
  return system === "metric" ? kmh : kmh * 0.621371;
}

/** "25°" / "–" — the degree symbol only, the unit name is shown separately. */
export function formatUnitTemp(value: number, system: UnitSystem): string {
  const converted = convertTemp(value, system);
  if (!Number.isFinite(converted)) return "–";
  const rounded = Math.round(converted);
  return `${rounded === 0 ? 0 : rounded}°`;
}

export function formatUnitSpeed(value: number, system: UnitSystem): string {
  const converted = convertSpeed(value, system);
  if (!Number.isFinite(converted)) return "–";
  return `${Math.round(converted)}`;
}

/** "3°" / "5°" for a temperature difference, already scaled to the system. */
export function formatUnitTempDelta(deltaCelsius: number, system: UnitSystem): string {
  const converted = convertTempDelta(deltaCelsius, system);
  if (!Number.isFinite(converted)) return "–";
  return `${Math.abs(Math.round(converted))}°`;
}
