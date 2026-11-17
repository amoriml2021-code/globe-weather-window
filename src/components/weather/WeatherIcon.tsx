import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
  type LucideIcon,
} from "lucide-react";

import { describeWeather, type ConditionIcon } from "@/lib/weather/conditions";
import { cn } from "@/lib/utils";

const ICONS: Record<ConditionIcon, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  "cloud-sun": CloudSun,
  "cloud-moon": CloudMoon,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: CloudSnow,
  storm: CloudLightning,
};

const TONE: Partial<Record<ConditionIcon, string>> = {
  sun: "text-sun",
  "cloud-sun": "text-sun",
  storm: "text-storm",
};

export function WeatherIcon({
  code,
  isDay = true,
  className,
  strokeWidth = 1.75,
}: {
  code: number;
  isDay?: boolean;
  className?: string;
  strokeWidth?: number;
}) {
  const { icon, label } = describeWeather(code, isDay);
  const Icon = ICONS[icon];
  return (
    <Icon
      role="img"
      aria-label={label}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", TONE[icon], className)}
    />
  );
}
