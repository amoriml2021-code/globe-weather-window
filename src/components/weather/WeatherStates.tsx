import { CloudOff, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

function Block({ className }: { className: string }) {
  return <div className={`glass animate-pulse rounded-3xl ${className}`} />;
}

export function WeatherSkeleton() {
  return (
    <div role="status" aria-live="polite" className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
      <span className="sr-only">Carregando previsão do tempo…</span>
      <div className="flex flex-col gap-6">
        <Block className="h-[22rem]" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Block key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Block className="h-44" />
      </div>
      <Block className="h-[34rem]" />
    </div>
  );
}

export function WeatherError({ message, onRetry, retrying }: { message: string; onRetry: () => void; retrying: boolean }) {
  return (
    <div role="alert" className="glass mx-auto flex max-w-lg flex-col items-center rounded-3xl p-10 text-center shadow-glass">
      <CloudOff className="size-14 text-muted-foreground" strokeWidth={1.5} aria-hidden />
      <h2 className="mt-4 font-display text-2xl font-bold">Não foi possível carregar o clima</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button onClick={onRetry} disabled={retrying} className="mt-6 rounded-xl px-6 font-semibold">
        <RefreshCw className={retrying ? "animate-spin" : undefined} aria-hidden />
        Tentar novamente
      </Button>
    </div>
  );
}
