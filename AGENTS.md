<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- Weather data comes straight from Open-Meteo (geocoding + forecast) in the browser via `src/lib/weather/api.ts`; no API key or backend, and never mock data. "Use my location" uses browser geolocation plus Nominatim reverse geocoding (`src/lib/weather/geolocation.ts`) only for the city name; if that lookup fails the coordinates are still used.
- The selected city lives in the `/` URL search params (`lat`, `lon`, `nome`, `regiao`, `pais`) so it survives refresh and can be shared; missing params fall back to `DEFAULT_PLACE`.
- Search history and favorites are per-browser in localStorage (`src/hooks/use-saved-places.ts`), read in `useEffect` to avoid hydration mismatches.
- The UI is a single "sky" theme: light text on dynamic gradient backgrounds defined as `--sky-*` tokens in `src/styles.css`, chosen from the WMO weather code in `src/lib/weather/conditions.ts`.
- UV index, sunrise/sunset come from the same Open-Meteo forecast call; air quality is a separate Open-Meteo Air Quality query so its failure never hides the weather. °C/°F choice is per-browser in localStorage via `src/hooks/use-units.tsx`; the API always returns metric and the UI converts.
