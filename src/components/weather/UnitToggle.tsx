import { useUnits } from "@/hooks/use-units";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "metric", short: "°C", long: "Celsius e quilômetros por hora" },
  { value: "imperial", short: "°F", long: "Fahrenheit e milhas por hora" },
] as const;

export function UnitToggle({ className }: { className?: string }) {
  const { system, setSystem } = useUnits();

  return (
    <div
      role="group"
      aria-label="Unidades de medida"
      className={cn("glass inline-flex items-center gap-1 rounded-full p-1 shadow-glass", className)}
    >
      {OPTIONS.map((option) => {
        const active = system === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => setSystem(option.value)}
            aria-pressed={active}
            title={option.long}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-bold transition-colors",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.short}
            <span className="sr-only"> — {option.long}</span>
          </button>
        );
      })}
    </div>
  );
}
