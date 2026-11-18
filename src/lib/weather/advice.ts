export type AdviceId =
  | "air-bad"
  | "uv-extreme"
  | "uv-high"
  | "rain"
  | "heat"
  | "cold-heavy"
  | "wind"
  | "air-sensitive"
  | "dry"
  | "cold"
  | "rain-possible"
  | "mild";

export type Advice = { id: AdviceId; title: string; text: string };

export type AdviceInput = {
  /** Always Celsius, whatever the screen shows. */
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  /** Always km/h. */
  windSpeed: number;
  precipitationProbability: number | null;
  uvIndex: number | null;
  uvIndexMax: number | null;
  /** US AQI. */
  aqi: number | null;
  isDay: boolean;
};

export const MAX_ADVICE = 4;

/**
 * Day-by-day tips, strongest warning first, capped at MAX_ADVICE.
 * Thresholds are the everyday ones used by weather services in Brazil.
 */
export function buildAdvice(input: AdviceInput): Advice[] {
  const {
    temperature,
    apparentTemperature,
    humidity,
    windSpeed,
    precipitationProbability,
    uvIndex,
    uvIndexMax,
    aqi,
    isDay,
  } = input;
  const precip = precipitationProbability ?? 0;
  const uvPeak = Math.max(uvIndex ?? 0, uvIndexMax ?? 0);
  const list: Advice[] = [];

  if (aqi !== null && aqi >= 151) {
    list.push({
      id: "air-bad",
      title: "Ar ruim lá fora",
      text: "Evite exercícios ao ar livre e fique o máximo possível em ambientes fechados.",
    });
  }

  if (isDay && uvPeak >= 11) {
    list.push({
      id: "uv-extreme",
      title: "Sol extremo",
      text: "Protetor fator 50, chapéu e óculos escuros. Fique na sombra entre 10h e 16h.",
    });
  } else if (isDay && uvPeak >= 8) {
    list.push({
      id: "uv-high",
      title: "Sol forte",
      text: "Passe protetor fator 30 a cada 2 horas e procure a sombra no meio do dia.",
    });
  }

  if (precip >= 60) {
    list.push({
      id: "rain",
      title: "Leve guarda-chuva",
      text: `A chance de chuva hoje é de ${Math.round(precip)}%.`,
    });
  }

  if (Number.isFinite(temperature) && temperature >= 32) {
    list.push({
      id: "heat",
      title: "Calorão",
      text: "Beba água com frequência e evite esforço físico debaixo de sol.",
    });
  }

  if (Number.isFinite(temperature) && temperature <= 12) {
    list.push({
      id: "cold-heavy",
      title: "Dia frio",
      text: "Agasalho, meia e cachecol valem a pena. A sensação é de " +
        `${Math.round(apparentTemperature)}°C.`,
    });
  }

  if (windSpeed >= 40) {
    list.push({
      id: "wind",
      title: "Vento forte",
      text: "Cuidado com objetos soltos, telhados e guarda-sóis ao ar livre.",
    });
  }

  if (aqi !== null && aqi >= 101 && aqi < 151) {
    list.push({
      id: "air-sensitive",
      title: "Ar pesado para alguns",
      text: "Crianças, idosos e pessoas asmáticas devem reduzir o esforço ao ar livre.",
    });
  }

  if (humidity > 0 && humidity <= 30 && temperature >= 20) {
    list.push({
      id: "dry",
      title: "Ar seco",
      text: "Hidrate a pele, beba mais água e umidifique o ambiente se puder.",
    });
  }

  if (Number.isFinite(temperature) && temperature > 12 && temperature <= 18) {
    list.push({
      id: "cold",
      title: "Um casaco ajuda",
      text: "A temperatura cai mais no fim do dia — leve uma camada extra.",
    });
  }

  if (precip >= 30 && precip < 60) {
    list.push({
      id: "rain-possible",
      title: "Pode chover",
      text: `Chance de ${Math.round(precip)}% de chuva. Um guarda-chuva pequeno não ocupa lugar.`,
    });
  }

  if (list.length === 0) {
    list.push({
      id: "mild",
      title: "Nada de alerta",
      text: "Dia tranquilo para sair: sem sol extremo, sem chuva provável e ar dentro do normal.",
    });
  }

  return list.slice(0, MAX_ADVICE);
}
