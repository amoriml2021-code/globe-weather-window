import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, LocateFixed, MapPin, Search } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { friendlyErrorMessage, placesQueryOptions } from "@/lib/weather/api";
import { GeolocationError, locateUser } from "@/lib/weather/geolocation";
import { validateCityQuery } from "@/lib/weather/format";
import { placeSubtitle } from "@/lib/weather/location";
import type { Place } from "@/lib/weather/types";
import { cn } from "@/lib/utils";

export function SearchBar({ onSelect, className }: { onSelect: (place: Place) => void; className?: string }) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 300);
    return () => clearTimeout(t);
  }, [term]);

  const suggestions = useQuery({
    ...placesQueryOptions(debounced),
    enabled: open && debounced.length >= 2,
  });
  const list = debounced.length >= 2 ? (suggestions.data ?? []) : [];
  const showList = open && debounced.length >= 2 && term.trim().length >= 2;

  function choose(place: Place) {
    onSelect(place);
    setTerm("");
    setDebounced("");
    setOpen(false);
    setActive(-1);
    setError(null);
    inputRef.current?.blur();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const highlighted = active >= 0 ? list[active] : undefined;
    if (showList && highlighted) return choose(highlighted);

    const check = validateCityQuery(term);
    if (!check.ok) {
      setError(check.message);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const results = await queryClient.fetchQuery(placesQueryOptions(check.value));
      const first = results[0];
      if (!first) {
        setOpen(false);
        setError(`Não encontramos “${check.value}”. Confira a grafia ou tente incluir o país (ex.: “Paris, França”).`);
      } else {
        choose(first);
      }
    } catch (err) {
      setError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLocate() {
    setLocating(true);
    setError(null);
    setOpen(false);
    try {
      choose(await locateUser());
    } catch (err) {
      setError(err instanceof GeolocationError ? err.message : "Não foi possível usar sua localização. Tente novamente.");
    } finally {
      setLocating(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!showList || list.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % list.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? list.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} role="search" className="glass flex items-center gap-2 rounded-2xl p-1.5 pl-4 shadow-glass">
        <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        <label htmlFor={`${listId}-input`} className="sr-only">
          Nome da cidade
        </label>
        <input
          ref={inputRef}
          id={`${listId}-input`}
          type="text"
          value={term}
          autoComplete="off"
          maxLength={100}
          placeholder="Digite uma cidade… ex.: Recife"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? true : undefined}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
            setActive(-1);
            if (error) setError(null);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => void handleLocate()}
          disabled={locating}
          aria-label="Usar minha localização atual"
          title="Usar minha localização atual"
          className="size-10 shrink-0 rounded-xl text-foreground hover:bg-accent"
        >
          {locating ? <Loader2 className="animate-spin" aria-hidden /> : <LocateFixed aria-hidden />}
        </Button>
        <Button type="submit" disabled={submitting} className="h-10 rounded-xl px-5 font-semibold">
          {submitting ? <Loader2 className="animate-spin" aria-hidden /> : null}
          Buscar
        </Button>
      </form>

      {error ? (
        <p role="alert" className="mt-2 rounded-xl bg-destructive/20 px-3 py-2 text-sm text-foreground">
          {error}
        </p>
      ) : null}

      {showList ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-border bg-popover py-1 text-popover-foreground shadow-glass"
        >
          {suggestions.isFetching && list.length === 0 ? (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Procurando cidades…
            </li>
          ) : suggestions.isError ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">{friendlyErrorMessage(suggestions.error)}</li>
          ) : list.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted-foreground">Nenhuma cidade encontrada com esse nome.</li>
          ) : (
            list.map((place, i) => (
              <li key={`${place.latitude},${place.longitude}`} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(place)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                    i === active ? "bg-accent" : "hover:bg-accent",
                  )}
                >
                  <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{place.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{placeSubtitle(place)}</span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
