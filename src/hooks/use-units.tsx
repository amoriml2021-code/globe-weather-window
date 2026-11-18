import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import {
  DEFAULT_UNIT_SYSTEM,
  formatUnitSpeed,
  formatUnitTemp,
  formatUnitTempDelta,
  isUnitSystem,
  speedSuffix,
  tempSuffix,
  type UnitSystem,
} from "@/lib/weather/units";

const UNITS_KEY = "clima-agora:unidades";

type UnitsValue = {
  system: UnitSystem;
  setSystem: (system: UnitSystem) => void;
  /** Celsius from the API → "25°" in the chosen system. */
  formatTemp: (celsius: number) => string;
  /** km/h from the API → "12" in the chosen system. */
  formatSpeed: (kmh: number) => string;
  /** Difference in Celsius from the API → "3°" in the chosen system. */
  formatTempDelta: (deltaCelsius: number) => string;
  tempSuffix: string;
  speedSuffix: string;
};

const UnitsContext = createContext<UnitsValue | null>(null);

function readSystem(): UnitSystem {
  try {
    const raw = window.localStorage.getItem(UNITS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isUnitSystem(parsed) ? parsed : DEFAULT_UNIT_SYSTEM;
  } catch {
    return DEFAULT_UNIT_SYSTEM;
  }
}

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [system, setSystemState] = useState<UnitSystem>(DEFAULT_UNIT_SYSTEM);

  // Read in an effect: the value lives in this browser only, so rendering it
  // during SSR or the first paint would mismatch.
  useEffect(() => {
    setSystemState(readSystem());
  }, []);

  const setSystem = useCallback((next: UnitSystem) => {
    setSystemState(next);
    try {
      window.localStorage.setItem(UNITS_KEY, JSON.stringify(next));
    } catch {
      // Storage blocked (private mode): the choice still applies for this visit.
    }
  }, []);

  const value = useMemo<UnitsValue>(
    () => ({
      system,
      setSystem,
      formatTemp: (celsius) => formatUnitTemp(celsius, system),
      formatSpeed: (kmh) => formatUnitSpeed(kmh, system),
      formatTempDelta: (delta) => formatUnitTempDelta(delta, system),
      tempSuffix: tempSuffix(system),
      speedSuffix: speedSuffix(system),
    }),
    [system, setSystem],
  );

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits(): UnitsValue {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits precisa estar dentro de <UnitsProvider>.");
  return ctx;
}
