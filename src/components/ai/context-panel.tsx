"use client";

import { Activity, Database, History, Plug } from "lucide-react";
import { Card } from "@/components/ui/card";
import { integrations } from "@/data/support";

const signals = [
  { title: "Speed to lead slipping", detail: "38 qualified leads waiting more than 24h", tone: "bg-warning" },
  { title: "Meta Reels under break-even", detail: "ROAS 1.7x and falling for 14 days", tone: "bg-danger" },
  { title: "Organic is compounding", detail: "+16.8% traffic, +21% organic leads", tone: "bg-success" },
];

export const recentThreads = [
  { title: "Why did revenue jump in October?", prompt: "Why did revenue jump this month?" },
  { title: "Q4 budget plan for paid media", prompt: "Optimize my campaigns for Q4 budget." },
  { title: "Which leads should Priya call today?", prompt: "Which leads should we call today?" },
  { title: "GEO gaps vs competitors", prompt: "Where are my GEO visibility gaps?" },
];

export function ContextPanel({ onPrompt }: { onPrompt: (p: string) => void }) {
  const connected = integrations.filter((i) => i.connected);
  return (
    <aside aria-label="Assistant context" className="space-y-4">
      <Card className="p-4">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
          <Database className="size-3.5 text-muted" aria-hidden /> Workspace context
        </h2>
        <p className="mt-1 text-[12px] text-muted">FadHype AI reads from {connected.length} connected sources.</p>
        <ul className="mt-3 space-y-2">
          {connected.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-2 text-[12.5px]">
              <span className="flex items-center gap-2 text-fg-2">
                <span className="size-1.5 rounded-full bg-success" aria-hidden />
                {i.name}
              </span>
              <span className="text-[11px] text-subtle">{i.lastSync}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex items-center gap-1.5 border-t border-line pt-3 text-[11.5px] text-subtle">
          <Plug className="size-3" aria-hidden /> Read-only access. Nothing changes without your approval.
        </p>
      </Card>

      <Card className="p-4">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
          <Activity className="size-3.5 text-muted" aria-hidden /> Signals this week
        </h2>
        <ul className="mt-3 space-y-3">
          {signals.map((s) => (
            <li key={s.title} className="flex gap-2.5">
              <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${s.tone}`} aria-hidden />
              <div>
                <p className="text-[12.5px] font-medium text-fg">{s.title}</p>
                <p className="text-[12px] text-muted">{s.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="p-4">
        <h2 className="flex items-center gap-2 text-[13px] font-semibold text-fg">
          <History className="size-3.5 text-muted" aria-hidden /> Recent threads
        </h2>
        <ul className="mt-2 -mx-1.5">
          {recentThreads.map((t) => (
            <li key={t.title}>
              <button type="button" onClick={() => onPrompt(t.prompt)} className="w-full truncate rounded-lg px-1.5 py-1.5 text-left text-[12.5px] text-fg-2 transition-colors hover:bg-surface-2 hover:text-fg">
                {t.title}
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </aside>
  );
}
