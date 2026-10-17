import { Badge, type BadgeTone } from "@/components/ui/badge";
import { leadStatuses } from "@/data/leads";
import { cn } from "@/lib/utils";
import type { LeadSource, LeadStatus } from "@/types";

const statusTone: Record<LeadStatus, BadgeTone> = {
  new: "outline",
  qualified: "brand",
  contacted: "info",
  proposal: "warning",
  converted: "success",
  lost: "neutral",
};

export function LeadStatusBadge({ status, className }: { status: LeadStatus; className?: string }) {
  const meta = leadStatuses.find((s) => s.id === status);
  return (
    <Badge tone={statusTone[status]} dot className={cn(status === "lost" && "text-muted", className)}>
      {meta?.label ?? status}
    </Badge>
  );
}

export function scoreBand(score: number) {
  if (score >= 80) return { label: "Hot", tone: "text-success", bar: "bg-success" };
  if (score >= 60) return { label: "Warm", tone: "text-warning", bar: "bg-warning" };
  return { label: "Cool", tone: "text-muted", bar: "bg-fg-2/40" };
}

export function LeadScore({ score, className }: { score: number; className?: string }) {
  const band = scoreBand(score);
  return (
    <span className={cn("inline-flex items-center gap-2", className)} aria-label={`Lead score ${score} of 100 (${band.label})`}>
      <span className="font-semibold text-fg tabular">{score}</span>
      <span className="h-1.5 w-12 overflow-hidden rounded-full bg-surface-3" aria-hidden>
        <span className={cn("block h-full rounded-full", band.bar)} style={{ width: `${score}%` }} />
      </span>
    </span>
  );
}

const sourceDot: Record<LeadSource, string> = {
  Google: "var(--chart-2)",
  Instagram: "var(--chart-5)",
  "Meta Ads": "var(--chart-1)",
  "Organic SEO": "var(--chart-4)",
  Referral: "var(--chart-3)",
  LinkedIn: "var(--info)",
};

export function SourceLabel({ source }: { source: LeadSource }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-fg-2">
      <span className="size-2 rounded-full" style={{ background: sourceDot[source] }} aria-hidden />
      {source}
    </span>
  );
}
