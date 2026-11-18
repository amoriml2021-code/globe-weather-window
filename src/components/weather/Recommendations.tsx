import {
  AlertTriangle,
  Droplets,
  Shirt,
  Smile,
  Snowflake,
  Sun,
  Thermometer,
  Umbrella,
  Wind,
  type LucideIcon,
} from "lucide-react";

import type { Advice, AdviceId } from "@/lib/weather/advice";

const ICONS: Record<AdviceId, LucideIcon> = {
  "air-bad": AlertTriangle,
  "uv-extreme": Sun,
  "uv-high": Sun,
  rain: Umbrella,
  heat: Thermometer,
  "cold-heavy": Snowflake,
  wind: Wind,
  "air-sensitive": Wind,
  dry: Droplets,
  cold: Shirt,
  "rain-possible": Umbrella,
  mild: Smile,
};

export function Recommendations({ advice }: { advice: Advice[] }) {
  if (advice.length === 0) return null;

  return (
    <section aria-labelledby="recomendacoes" className="glass rounded-3xl p-5 shadow-glass">
      <h2 id="recomendacoes" className="font-display text-lg font-bold">
        Recomendações do dia
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {advice.map((item) => {
          const Icon = ICONS[item.id] ?? Smile;
          return (
            <li key={item.id} className="flex gap-3 rounded-2xl bg-muted p-3">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent">
                <Icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
