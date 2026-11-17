import { useCallback, useEffect, useState } from "react";

import { placeKey, pushRecent } from "@/lib/weather/location";
import type { Place } from "@/lib/weather/types";

const HISTORY_KEY = "clima-agora:historico";
const FAVORITES_KEY = "clima-agora:favoritos";
export const MAX_HISTORY = 6;

function read(key: string): Place[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p): p is Place =>
        typeof p === "object" &&
        p !== null &&
        typeof (p as Place).name === "string" &&
        typeof (p as Place).latitude === "number" &&
        typeof (p as Place).longitude === "number",
    );
  } catch {
    return [];
  }
}

function write(key: string, value: Place[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): keep working in memory.
  }
}

export function useSavedPlaces() {
  const [history, setHistory] = useState<Place[]>([]);
  const [favorites, setFavorites] = useState<Place[]>([]);

  useEffect(() => {
    setHistory(read(HISTORY_KEY));
    setFavorites(read(FAVORITES_KEY));
  }, []);

  const addToHistory = useCallback((place: Place) => {
    setHistory((prev) => {
      const next = pushRecent(prev, place, MAX_HISTORY);
      write(HISTORY_KEY, next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    write(HISTORY_KEY, []);
  }, []);

  const toggleFavorite = useCallback((place: Place) => {
    setFavorites((prev) => {
      const key = placeKey(place);
      const exists = prev.some((p) => placeKey(p) === key);
      const next = exists ? prev.filter((p) => placeKey(p) !== key) : [...prev, place];
      write(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (place: Place) => favorites.some((p) => placeKey(p) === placeKey(place)),
    [favorites],
  );

  return { history, favorites, addToHistory, clearHistory, toggleFavorite, isFavorite };
}
