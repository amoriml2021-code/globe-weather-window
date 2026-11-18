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

describe("current location", () => {
  it("uses the city name and keeps exact coordinates", async () => {
    const { placeFromAddress } = await import("@/lib/weather/geolocation");
    expect(placeFromAddress({ city: "Campinas", state: "São Paulo", country: "Brasil", country_code: "br" }, -22.9, -47.06)).toEqual({
      name: "Campinas",
      admin1: "São Paulo",
      country: "Brasil",
      countryCode: "BR",
      latitude: -22.9,
      longitude: -47.06,
    });
  });
  it("falls back to Minha localização when the city is unknown", async () => {
    const { placeFromAddress } = await import("@/lib/weather/geolocation");
    expect(placeFromAddress(undefined, 1, 2).name).toBe("Minha localização");
  });
  it("denied permission explains how to allow it", async () => {
    const { geolocationErrorMessage } = await import("@/lib/weather/geolocation");
    expect(geolocationErrorMessage(1)).toContain("Permissão de localização negada");
  });
});

describe("unit system", () => {
  it("converts Celsius to Fahrenheit", async () => {
    const { convertTemp, formatUnitTemp } = await import("@/lib/weather/units");
    expect(convertTemp(25, "imperial")).toBe(77);
    expect(formatUnitTemp(25, "imperial")).toBe("77°");
    expect(formatUnitTemp(25, "metric")).toBe("25°");
  });

  it("scales a temperature difference without the +32 offset", async () => {
    const { convertTempDelta, formatUnitTempDelta } = await import("@/lib/weather/units");
    expect(convertTempDelta(10, "imperial")).toBe(18);
    expect(formatUnitTempDelta(-4, "imperial")).toBe("7°");
  });

  it("converts km/h to mph and labels both", async () => {
    const { convertSpeed, speedSuffix, tempSuffix } = await import("@/lib/weather/units");
    expect(convertSpeed(10, "imperial")).toBeCloseTo(6.21, 2);
    expect(speedSuffix("metric")).toBe("km/h");
    expect(speedSuffix("imperial")).toBe("mph");
    expect(tempSuffix("imperial")).toBe("°F");
  });

  it("keeps a missing value as a dash", async () => {
    const { formatUnitTemp } = await import("@/lib/weather/units");
    expect(formatUnitTemp(Number.NaN, "imperial")).toBe("–");
  });
});

describe("sun arc", () => {
  const sunrise = "2026-11-18T05:12";
  const sunset = "2026-11-18T18:30";

  it("places the sun along the arc during the day", async () => {
    const { computeSunPhase } = await import("@/lib/weather/sun");
    const phase = computeSunPhase("2026-11-18T12:00", sunrise, sunset);
    expect(phase?.phase).toBe("daytime");
    expect(phase?.progress).toBeCloseTo(408 / 798, 4);
    expect(phase?.daylightMinutes).toBe(798);
    expect(phase?.minutesUntilSunset).toBe(390);
  });

  it("keeps the sun at the horizon before sunrise and after sunset", async () => {
    const { computeSunPhase } = await import("@/lib/weather/sun");
    expect(computeSunPhase("2026-11-18T04:00", sunrise, sunset)).toMatchObject({
      phase: "before-sunrise",
      progress: 0,
      minutesUntilSunrise: 72,
    });
    expect(computeSunPhase("2026-11-18T19:00", sunrise, sunset)).toMatchObject({
      phase: "after-sunset",
      progress: 1,
    });
  });

  it("gives up when the times are missing", async () => {
    const { computeSunPhase } = await import("@/lib/weather/sun");
    expect(computeSunPhase("2026-11-18T12:00", null, sunset)).toBeNull();
  });

  it("writes daylight as hours and minutes", async () => {
    const { formatDuration, formatRemaining } = await import("@/lib/weather/sun");
    expect(formatDuration(798)).toBe("13 h 18 min");
    expect(formatDuration(120)).toBe("2 h");
    expect(formatRemaining(8)).toBe("8 min");
  });
});

describe("UV index bands", () => {
  it("labels the WHO bands", async () => {
    const { classifyUv } = await import("@/lib/weather/sun");
    expect(classifyUv(2)?.label).toBe("Baixo");
    expect(classifyUv(5)?.tone).toBe("moderate");
    expect(classifyUv(7)?.label).toBe("Alto");
    expect(classifyUv(9)?.label).toBe("Muito alto");
    expect(classifyUv(12)?.label).toBe("Extremo");
    expect(classifyUv(null)).toBeNull();
  });
});

describe("air quality levels", () => {
  it("classifies the US AQI scale", async () => {
    const { classifyAqi } = await import("@/lib/weather/air");
    expect(classifyAqi(40)).toMatchObject({ label: "Boa", tone: "good" });
    expect(classifyAqi(80)?.label).toBe("Moderada");
    expect(classifyAqi(120)?.tone).toBe("sensitive");
    expect(classifyAqi(180)?.label).toBe("Ruim");
    expect(classifyAqi(250)?.label).toBe("Muito ruim");
    expect(classifyAqi(400)?.label).toBe("Perigosa");
    expect(classifyAqi(null)).toBeNull();
  });
});

describe("daily recommendations", () => {
  const base = {
    temperature: 24,
    apparentTemperature: 24,
    humidity: 55,
    windSpeed: 10,
    precipitationProbability: 10,
    uvIndex: 1,
    uvIndexMax: 2,
    aqi: 30,
    isDay: true,
  };

  it("says nothing is wrong on a calm day", async () => {
    const { buildAdvice } = await import("@/lib/weather/advice");
    expect(buildAdvice(base)).toEqual([
      { id: "mild", title: "Nada de alerta", text: expect.any(String) },
    ]);
  });

  it("warns about rain with the real percentage", async () => {
    const { buildAdvice } = await import("@/lib/weather/advice");
    const advice = buildAdvice({ ...base, precipitationProbability: 80 });
    expect(advice.map((a) => a.id)).toContain("rain");
    expect(advice.find((a) => a.id === "rain")?.text).toContain("80%");
  });

  it("only warns about the sun while it is up", async () => {
    const { buildAdvice } = await import("@/lib/weather/advice");
    expect(buildAdvice({ ...base, uvIndexMax: 9 }).map((a) => a.id)).toContain("uv-high");
    expect(buildAdvice({ ...base, uvIndexMax: 9, isDay: false }).map((a) => a.id)).not.toContain("uv-high");
  });

  it("puts the worst warning first and shows at most four", async () => {
    const { buildAdvice, MAX_ADVICE } = await import("@/lib/weather/advice");
    const advice = buildAdvice({
      ...base,
      temperature: 35,
      apparentTemperature: 38,
      humidity: 20,
      windSpeed: 50,
      precipitationProbability: 90,
      uvIndex: 12,
      uvIndexMax: 12,
      aqi: 200,
    });
    expect(advice).toHaveLength(MAX_ADVICE);
    expect(advice[0]?.id).toBe("air-bad");
    expect(advice.map((a) => a.id)).toEqual(["air-bad", "uv-extreme", "rain", "heat"]);
  });
});
