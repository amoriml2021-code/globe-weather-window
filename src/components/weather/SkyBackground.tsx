import type { Sky } from "@/lib/weather/conditions";
import { cn } from "@/lib/utils";

const SKIES: Sky[] = ["clear-day", "partly-day", "night", "overcast", "rain", "storm", "snow", "fog"];

export function SkyBackground({ sky }: { sky: Sky }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      {SKIES.map((s) => (
        <div
          key={s}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            s === sky ? "opacity-100" : "opacity-0",
          )}
          style={{ backgroundImage: `var(--sky-${s})` }}
        />
      ))}
      <div
        className={cn(
          "fx-rain absolute inset-0 transition-opacity duration-1000",
          sky === "rain" || sky === "storm" ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "fx-snow absolute inset-0 transition-opacity duration-1000",
          sky === "snow" ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background/50 to-transparent" />
    </div>
  );
}
