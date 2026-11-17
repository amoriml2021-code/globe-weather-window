export type Place = {
  name: string;
  admin1?: string | undefined;
  country?: string | undefined;
  countryCode?: string | undefined;
  latitude: number;
  longitude: number;
};

export type CurrentConditions = {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  isDay: boolean;
};

export type HourPoint = {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number | null;
  isDay: boolean;
};

export type DayPoint = {
  date: string;
  weatherCode: number;
  max: number;
  min: number;
  precipitationProbability: number | null;
};

export type Forecast = {
  timezone: string;
  current: CurrentConditions;
  hourly: HourPoint[];
  daily: DayPoint[];
};
