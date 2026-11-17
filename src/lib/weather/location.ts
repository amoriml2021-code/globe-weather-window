import type { Place } from "./types";

export type LocationSearch = {
  lat?: number;
  lon?: number;
  nome?: string;
  regiao?: string;
  pais?: string;
};

export const DEFAULT_PLACE: Place = {
  name: "São Paulo",
  admin1: "São Paulo",
  country: "Brasil",
  countryCode: "BR",
  latitude: -23.5475,
  longitude: -46.63611,
};

function toNumber(value: unknown): number | undefined {
  const n = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function toText(value: unknown): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const text = String(value).trim().slice(0, 120);
  return text || undefined;
}

export function parseLocationSearch(search: Record<string, unknown>): LocationSearch {
  const out: LocationSearch = {};
  const lat = toNumber(search["lat"]);
  const lon = toNumber(search["lon"]);
  const nome = toText(search["nome"]);
  const regiao = toText(search["regiao"]);
  const pais = toText(search["pais"]);
  if (lat !== undefined && lat >= -90 && lat <= 90) out.lat = lat;
  if (lon !== undefined && lon >= -180 && lon <= 180) out.lon = lon;
  if (nome) out.nome = nome;
  if (regiao) out.regiao = regiao;
  if (pais) out.pais = pais;
  return out;
}

export function placeFromSearch(search: LocationSearch): Place {
  if (search.lat === undefined || search.lon === undefined || !search.nome) return DEFAULT_PLACE;
  return {
    name: search.nome,
    admin1: search.regiao,
    country: search.pais,
    latitude: search.lat,
    longitude: search.lon,
  };
}

export function placeToSearch(place: Place): LocationSearch {
  const out: LocationSearch = {
    lat: Number(place.latitude.toFixed(4)),
    lon: Number(place.longitude.toFixed(4)),
    nome: place.name,
  };
  if (place.admin1) out.regiao = place.admin1;
  if (place.country) out.pais = place.country;
  return out;
}

export function placeKey(place: Pick<Place, "latitude" | "longitude">): string {
  return `${place.latitude.toFixed(2)},${place.longitude.toFixed(2)}`;
}

export function placeSubtitle(place: Place): string {
  return [place.admin1 !== place.name ? place.admin1 : undefined, place.country]
    .filter(Boolean)
    .join(", ");
}

/** Puts `place` at the front of the list, removing duplicates, capped at `max`. */
export function pushRecent(list: Place[], place: Place, max: number): Place[] {
  const key = placeKey(place);
  return [place, ...list.filter((p) => placeKey(p) !== key)].slice(0, max);
}
