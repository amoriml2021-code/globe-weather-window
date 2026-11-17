import { History, Star, X } from "lucide-react";
import type { ReactNode } from "react";

import { placeKey } from "@/lib/weather/location";
import type { Place } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

function Chip({ place, active, onClick, icon }: { place: Place; active: boolean; onClick: () => void; icon?: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      title={[place.name, place.admin1, place.country].filter(Boolean).join(", ")}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm transition-colors",
        active ? "bg-foreground text-background" : "bg-muted hover:bg-accent",
      )}
    >
      {icon}
      {place.name}
      {place.country ? <span className={cn("text-xs", active ? "opacity-70" : "text-muted-foreground")}>{place.countryCode ?? place.country}</span> : null}
    </button>
  );
}

export function SavedPlaces({
  favorites,
  history,
  current,
  onSelect,
  onClearHistory,
}: {
  favorites: Place[];
  history: Place[];
  current: Place;
  onSelect: (place: Place) => void;
  onClearHistory: () => void;
}) {
  if (favorites.length === 0 && history.length === 0) return null;
  const currentKey = placeKey(current);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
      {favorites.length > 0 ? (
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Star className="size-3.5" aria-hidden /> Favoritas
          </span>
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
            {favorites.map((p) => (
              <Chip key={placeKey(p)} place={p} active={placeKey(p) === currentKey} onClick={() => onSelect(p)} />
            ))}
          </div>
        </div>
      ) : null}
      {history.length > 0 ? (
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <History className="size-3.5" aria-hidden /> Recentes
          </span>
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
            {history.map((p) => (
              <Chip key={placeKey(p)} place={p} active={placeKey(p) === currentKey} onClick={() => onSelect(p)} />
            ))}
          </div>
          <button
            type="button"
            onClick={onClearHistory}
            aria-label="Limpar histórico"
            title="Limpar histórico"
            className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
