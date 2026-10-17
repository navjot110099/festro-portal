import {
  ChartColumn,
  ChartLine,
  CodeXml,
  FileChartColumn,
  Gem,
  Layers,
  Magnet,
  MessagesSquare,
  MousePointerClick,
  Radar,
  Rocket,
  SearchCheck,
  ShoppingBag,
  Sparkles,
  Target,
  UsersRound,
  Waypoints,
  Workflow,
  type LucideIcon,
} from "lucide-react";

/** Icons referenced by name from the data layer (services, AI quick actions). */
const registry: Record<string, LucideIcon> = {
  ChartColumn,
  ChartLine,
  CodeXml,
  FileChartColumn,
  Gem,
  Layers,
  Magnet,
  MessagesSquare,
  MousePointerClick,
  Radar,
  Rocket,
  SearchCheck,
  ShoppingBag,
  Sparkles,
  Target,
  UsersRound,
  Waypoints,
  Workflow,
};

export function DataIcon({ name, className }: { name: string; className?: string }) {
  const Icon = registry[name] ?? Sparkles;
  return <Icon className={className} aria-hidden />;
}
