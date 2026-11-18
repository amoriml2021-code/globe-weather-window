import type { Place } from "./types";

const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

export class GeolocationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeolocationError";
  }
}

/** Portuguese message for a browser geolocation failure code (1 = denied, 2 = unavailable, 3 = timeout). */
export function geolocationErrorMessage(code: number): string {
  if (code === 1) {
    return "Permissão de localização negada. Libere o acesso à localização nas configurações do navegador (ícone de cadeado ao lado do endereço) e tente de novo.";
  }
  if (code === 3) return "Demorou demais para encontrar sua localização. Tente novamente.";
  return "Não foi possível descobrir sua localização agora. Verifique se o GPS/localização do aparelho está ligado ou pesquise a cidade pelo nome.";
}

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new GeolocationError("Seu navegador não permite usar a localização. Pesquise a cidade pelo nome."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => reject(new GeolocationError(geolocationErrorMessage(err.code))),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 5 * 60 * 1000 },
    );
  });
}

type ReverseAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
};

/** Builds a Place from a reverse-geocoding address, keeping the exact coordinates. */
export function placeFromAddress(address: ReverseAddress | undefined, latitude: number, longitude: number): Place {
  const name =
    address?.city ?? address?.town ?? address?.village ?? address?.municipality ?? address?.county ?? address?.suburb;
  return {
    name: name ?? "Minha localização",
    admin1: address?.state,
    country: address?.country,
    countryCode: address?.country_code?.toUpperCase(),
    latitude,
    longitude,
  };
}

async function reverseGeocode(latitude: number, longitude: number): Promise<Place> {
  try {
    const url = new URL(REVERSE_URL);
    url.searchParams.set("lat", latitude.toFixed(5));
    url.searchParams.set("lon", longitude.toFixed(5));
    url.searchParams.set("format", "json");
    url.searchParams.set("zoom", "10");
    url.searchParams.set("accept-language", "pt-BR");
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(String(response.status));
    const data = (await response.json()) as { address?: ReverseAddress };
    return placeFromAddress(data.address, latitude, longitude);
  } catch {
    // The forecast only needs coordinates; show a generic name if the city lookup fails.
    return placeFromAddress(undefined, latitude, longitude);
  }
}

/** Asks the browser for the user's position and resolves the nearest city name. */
export async function locateUser(): Promise<Place> {
  const position = await getPosition();
  return reverseGeocode(position.coords.latitude, position.coords.longitude);
}
