import { describe, expect, it } from "vitest";

import { describeWeather } from "@/lib/weather/conditions";
import { compassDirection, upcomingHours, validateCityQuery } from "@/lib/weather/format";
import { DEFAULT_PLACE, parseLocationSearch, placeFromSearch, pushRecent } from "@/lib/weather/location";
import type { Place } from "@/lib/weather/types";

describe("condition labels (WMO codes)", () => {
  it("clear sky by day is Ensolarado", () => expect(describeWeather(0, true).label).toBe("Ensolarado"));
  it("clear sky at night is Céu limpo with night sky", () => {
    expect(describeWeather(0, false)).toMatchObject({ label: "Céu limpo", sky: "night" });
  });
  it("code 2 is Parcialmente nublado", () => expect(describeWeather(2).label).toBe("Parcialmente nublado"));
  it("code 3 is Nublado", () => expect(describeWeather(3).label).toBe("Nublado"));
  it("code 45 is Neblina", () => expect(describeWeather(45).label).toBe("Neblina"));
  it("code 63 is Chuva", () => expect(describeWeather(63)).toMatchObject({ label: "Chuva", sky: "rain" }));
  it("code 95 is Tempestade", () => expect(describeWeather(95)).toMatchObject({ label: "Tempestade", sky: "storm" }));
  it("code 73 is Neve", () => expect(describeWeather(73)).toMatchObject({ label: "Neve", sky: "snow" }));
});

describe("city search validation", () => {
  it("rejects empty input", () => expect(validateCityQuery("   ").ok).toBe(false));
  it("rejects a single letter", () => expect(validateCityQuery("a").ok).toBe(false));
  it("rejects input without letters", () => expect(validateCityQuery("1234").ok).toBe(false));
  it("accepts and tidies a city name", () => {
    expect(validateCityQuery("  São   Paulo ")).toEqual({ ok: true, value: "São Paulo" });
  });
});

describe("recent searches", () => {
  const city = (name: string, lat: number): Place => ({ name, latitude: lat, longitude: 0 });

  it("keeps at most 6 cities, newest first", () => {
    let list: Place[] = [];
    for (let i = 0; i < 8; i++) list = pushRecent(list, city(`C${i}`, i), 6);
    expect(list.map((p) => p.name)).toEqual(["C7", "C6", "C5", "C4", "C3", "C2"]);
  });

  it("moves a repeated city to the front without duplicating it", () => {
    const list = pushRecent([city("A", 1), city("B", 2)], city("B", 2), 6);
    expect(list.map((p) => p.name)).toEqual(["B", "A"]);
  });
});

describe("starting city and hours", () => {
  it("opens on São Paulo when no city is chosen", () => {
    expect(placeFromSearch(parseLocationSearch({}))).toBe(DEFAULT_PLACE);
    expect(DEFAULT_PLACE.name).toBe("São Paulo");
  });

  it("next hours start at the current hour", () => {
    const hours = ["2026-11-17T13:00", "2026-11-17T14:00", "2026-11-17T15:00"].map((time) => ({ time }));
    expect(upcomingHours(hours, "2026-11-17T14:45", 2).map((h) => h.time)).toEqual([
      "2026-11-17T14:00",
      "2026-11-17T15:00",
    ]);
  });

  it("wind direction uses Portuguese compass points", () => {
    expect(compassDirection(90)).toBe("L");
    expect(compassDirection(270)).toBe("O");
  });
});
