"use client";

import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Download, Plus, Search, UsersRound, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { LeadDrawer } from "@/components/leads/lead-drawer";
import { LeadScore, LeadStatusBadge, SourceLabel } from "@/components/leads/lead-ui";
import { NewLeadDialog } from "@/components/leads/new-lead-dialog";
import { useToast } from "@/components/providers/toast-provider";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { Input, NativeSelect } from "@/components/ui/input";
import { Delta } from "@/components/ui/metric";
import { leadSourcesList, leadStatuses } from "@/data/leads";
import { getMember, team } from "@/data/user";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { formatCurrency, formatNumber, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Lead, LeadStatus } from "@/types";

type SortKey = "lastActivity" | "score" | "value" | "name";
const PAGE_SIZE = 10;

function exportCsv(leads: Lead[]) {
  const header = ["Name", "Title", "Company", "Email", "Source", "Status", "Score", "Value", "Owner", "Last activity"];
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const rows = leads.map((l) => [l.name, l.title, l.company, l.email, l.source, l.status, l.score, l.value, getMember(l.assignedTo)?.name ?? "", l.lastActivity].map(esc).join(","));
  const blob = new Blob([[header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: "festro-leads.csv" });
  a.click();
  URL.revokeObjectURL(url);
}

function PipelineFilters({ active, onChange }: { active: LeadStatus | "all"; onChange: (s: LeadStatus | "all") => void }) {
  const summary = useResource(() => api.leads.summary());
  const items: { id: LeadStatus | "all"; label: string; value?: number; change?: number }[] = [
    { id: "all", label: "Total leads", value: summary.data?.total, change: summary.data?.change.total },
    ...leadStatuses.map((s) => ({ id: s.id, label: s.label, value: summary.data?.byStatus[s.id], change: summary.data?.change[s.id] })),
  ];
  return (
    <div role="group" aria-label="Filter by stage" className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 xl:grid-cols-7">
      {items.map((it) => {
        const selected = active === it.id;
        return (
          <button
            key={it.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected && it.id !== "all" ? "all" : it.id)}
            className={cn(
              "relative min-w-[136px] snap-start rounded-2xl border p-4 text-left transition-all duration-200",
              selected ? "border-accent/35 bg-surface shadow-md ring-4 ring-accent-soft" : "border-line bg-surface shadow-xs hover:-translate-y-0.5 hover:border-line-strong hover:shadow-sm",
            )}
          >
            <p className="text-[12px] font-medium text-muted">{it.label}</p>
            {summary.status === "loading" ? (
              <Skeleton className="mt-2 h-6 w-16" />
            ) : (
              <p className="mt-1.5 text-[21px] leading-7 font-semibold tracking-[-0.03em] text-fg">{it.value !== undefined ? formatNumber(it.value) : "—"}</p>
            )}
            {it.change !== undefined && <Delta change={it.change} size="xs" inverse={it.id === "lost"} className="mt-1" />}
          </button>
        );
      })}
    </div>
  );
}

function SortHeader({ label, k, sort, onSort, className }: { label: string; k: SortKey; sort: { key: SortKey; dir: "asc" | "desc" }; onSort: (k: SortKey) => void; className?: string }) {
  const active = sort.key === k;
  return (
    <th scope="col" aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={cn("px-3 py-2.5 font-medium", className)}>
      <button type="button" onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 hover:text-fg", active && "text-fg")}>
        {label}
        {active && (sort.dir === "asc" ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />)}
      </button>
    </th>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-3.5">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-2.5 w-24" />
          </div>
          <Skeleton className="hidden h-5 w-20 rounded-full md:block" />
          <Skeleton className="hidden h-3 w-16 md:block" />
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}

export function LeadsView() {
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const res = useResource(() => api.leads.list());

  const [status, setStatus] = useState<LeadStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");
  const [owner, setOwner] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "lastActivity", dir: "desc" });
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(params.get("lead"));
  const [drawerOpen, setDrawerOpen] = useState(Boolean(params.get("lead")));
  const [newOpen, setNewOpen] = useState(params.get("new") === "1");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (res.data ?? []).filter(
      (l) =>
        (status === "all" || l.status === status) &&
        (source === "all" || l.source === source) &&
        (owner === "all" || l.assignedTo === owner) &&
        (!q || `${l.name} ${l.company} ${l.email} ${l.interest}`.toLowerCase().includes(q)),
    );
    const dir = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      if (sort.key === "name") return a.name.localeCompare(b.name) * dir;
      if (sort.key === "lastActivity") return (+new Date(a.lastActivity) - +new Date(b.lastActivity)) * dir;
      return (a[sort.key] - b[sort.key]) * dir;
    });
  }, [res.data, status, source, owner, query, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const selected = res.data?.find((l) => l.id === selectedId) ?? null;
  const hasFilters = status !== "all" || source !== "all" || owner !== "all" || query !== "";

  const onSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" ? "asc" : "desc" }));
  const open = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
  };
  const resetFilters = () => {
    setStatus("all");
    setSource("all");
    setOwner("all");
    setQuery("");
    setPage(0);
  };
  const updateLead = (lead: Lead) => res.setData((list) => list.map((l) => (l.id === lead.id ? lead : l)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Every enquiry, scored and routed, from first touch to booked client."
        actions={
          <>
            <Button variant="secondary" disabled={!filtered.length} onClick={() => exportCsv(filtered)}>
              <Download /> Export CSV
            </Button>
            <Button onClick={() => setNewOpen(true)}>
              <Plus /> Add lead
            </Button>
          </>
        }
      />

      <PipelineFilters
        active={status}
        onChange={(s) => {
          setStatus(s);
          setPage(0);
        }}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 lg:flex-row lg:items-center">
          <div className="lg:max-w-xs lg:flex-1">
            <Input
              type="search"
              aria-label="Search leads"
              placeholder="Search name, company or email"
              leading={<Search />}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
            <NativeSelect aria-label="Filter by source" value={source} onChange={(e) => {
                setSource(e.target.value);
                setPage(0);
              }} className="sm:w-40">
              <option value="all">All sources</option>
              {leadSourcesList.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </NativeSelect>
            <NativeSelect aria-label="Filter by owner" value={owner} onChange={(e) => {
                setOwner(e.target.value);
                setPage(0);
              }} className="sm:w-40">
              <option value="all">All owners</option>
              {team.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              aria-label="Sort leads"
              value={`${sort.key}:${sort.dir}`}
              onChange={(e) => {
                const [key, dir] = e.target.value.split(":") as [SortKey, "asc" | "desc"];
                setSort({ key, dir });
              }}
              className="col-span-2 sm:w-48 lg:hidden"
            >
              <option value="lastActivity:desc">Most recent activity</option>
              <option value="score:desc">Highest score</option>
              <option value="value:desc">Highest value</option>
              <option value="name:asc">Name A–Z</option>
            </NativeSelect>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="col-span-2 sm:col-span-1">
                <X /> Clear filters
              </Button>
            )}
          </div>
          <p className="text-[12.5px] text-muted lg:ml-auto" aria-live="polite">
            {res.status === "success" && `${filtered.length} ${filtered.length === 1 ? "lead" : "leads"}`}
          </p>
        </div>

        <AsyncView
          status={res.status}
          data={res.data}
          error={res.error}
          onRetry={res.reload}
          skeleton={<TableSkeleton />}
          empty={{
            title: "No leads yet",
            description: "Connect your forms, ad lead forms or CRM, or add your first lead manually.",
            icon: UsersRound,
            action: (
              <Button size="sm" onClick={() => setNewOpen(true)}>
                <Plus /> Add lead
              </Button>
            ),
          }}
        >
          {() =>
            filtered.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
                <p className="text-sm font-medium text-fg">No leads match these filters</p>
                <p className="text-[13px] text-muted">Try a different search or clear the filters.</p>
                <Button variant="secondary" size="sm" onClick={resetFilters} className="mt-2">
                  Clear filters
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full text-left text-[13px]">
                    <caption className="sr-only">Leads, sorted by {sort.key}</caption>
                    <thead className="bg-surface-2/60 text-[11.5px] text-muted">
                      <tr>
                        <SortHeader label="Name" k="name" sort={sort} onSort={onSort} className="pl-5" />
                        <th scope="col" className="px-3 py-2.5 font-medium">
                          Company
                        </th>
                        <th scope="col" className="px-3 py-2.5 font-medium">
                          Source
                        </th>
                        <th scope="col" className="px-3 py-2.5 font-medium">
                          Status
                        </th>
                        <SortHeader label="Lead score" k="score" sort={sort} onSort={onSort} />
                        <SortHeader label="Value" k="value" sort={sort} onSort={onSort} className="text-right" />
                        <th scope="col" className="px-3 py-2.5 font-medium">
                          Assigned to
                        </th>
                        <SortHeader label="Last activity" k="lastActivity" sort={sort} onSort={onSort} className="pr-5" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {visible.map((l, i) => {
                        const m = getMember(l.assignedTo);
                        return (
                          <tr
                            key={l.id}
                            style={{ animationDelay: `${i * 20}ms` }}
                            onClick={() => open(l.id)}
                            className="group animate-[fade_400ms_ease-out_backwards] cursor-pointer transition-colors hover:bg-surface-2/70"
                          >
                            <td className="py-3 pr-3 pl-5">
                              <div className="flex items-center gap-3">
                                <Avatar initials={l.initials} hue={(l.name.charCodeAt(0) * 37) % 360} size="md" />
                                <div className="min-w-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      open(l.id);
                                    }}
                                    className="font-medium text-fg group-hover:text-accent-ink"
                                  >
                                    {l.name}
                                  </button>
                                  <p className="truncate text-[12px] text-muted">{l.title}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-fg-2">
                              <p className="max-w-44 truncate">{l.company}</p>
                              <p className="max-w-44 truncate text-[12px] text-subtle">{l.interest}</p>
                            </td>
                            <td className="px-3 py-3">
                              <SourceLabel source={l.source} />
                            </td>
                            <td className="px-3 py-3">
                              <LeadStatusBadge status={l.status} />
                            </td>
                            <td className="px-3 py-3">
                              <LeadScore score={l.score} />
                            </td>
                            <td className="px-3 py-3 text-right font-medium text-fg tabular">{formatCurrency(l.value)}</td>
                            <td className="px-3 py-3">
                              {m && (
                                <span className="flex items-center gap-2 whitespace-nowrap text-fg-2">
                                  <Avatar initials={m.initials} hue={m.hue} size="xs" />
                                  {m.name.split(" ")[0]}
                                </span>
                              )}
                            </td>
                            <td className="py-3 pr-5 pl-3 whitespace-nowrap text-muted">
                              <time dateTime={l.lastActivity}>{formatRelative(l.lastActivity)}</time>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile / tablet cards */}
                <ul className="divide-y divide-line lg:hidden">
                  {visible.map((l) => {
                    const m = getMember(l.assignedTo);
                    return (
                      <li key={l.id}>
                        <button type="button" onClick={() => open(l.id)} className="flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors active:bg-surface-2">
                          <Avatar initials={l.initials} hue={(l.name.charCodeAt(0) * 37) % 360} size="md" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-[13.5px] font-medium text-fg">{l.name}</p>
                                <p className="truncate text-[12px] text-muted">{l.company}</p>
                              </div>
                              <p className="shrink-0 text-[13.5px] font-semibold text-fg tabular">{formatCurrency(l.value)}</p>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12px]">
                              <LeadStatusBadge status={l.status} />
                              <LeadScore score={l.score} />
                              <SourceLabel source={l.source} />
                            </div>
                            <p className="mt-1.5 text-[11.5px] text-subtle">
                              {m?.name} · {formatRelative(l.lastActivity)}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-[12.5px] text-muted sm:px-5">
                  <span>
                    Showing <span className="font-medium text-fg-2">{current * PAGE_SIZE + 1}</span>–
                    <span className="font-medium text-fg-2">{Math.min(filtered.length, (current + 1) * PAGE_SIZE)}</span> of{" "}
                    <span className="font-medium text-fg-2">{filtered.length}</span>
                  </span>
                  <nav aria-label="Pagination" className="flex items-center gap-1">
                    <Button variant="ghost" size="icon-sm" aria-label="Previous page" disabled={current === 0} onClick={() => setPage(current - 1)}>
                      <ChevronLeft />
                    </Button>
                    <span className="px-2 tabular">
                      {current + 1} / {pages}
                    </span>
                    <Button variant="ghost" size="icon-sm" aria-label="Next page" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
                      <ChevronRight />
                    </Button>
                  </nav>
                </div>
              </>
            )
          }
        </AsyncView>
      </Card>

      <LeadDrawer
        lead={selected}
        open={drawerOpen && Boolean(selected)}
        onOpenChange={(v) => {
          setDrawerOpen(v);
          if (!v && params.get("lead")) router.replace("/leads", { scroll: false });
        }}
        onUpdate={updateLead}
      />
      <NewLeadDialog
        open={newOpen}
        onOpenChange={(v) => {
          setNewOpen(v);
          if (!v && params.get("new")) router.replace("/leads", { scroll: false });
        }}
        onCreate={(lead) => {
          res.setData((list) => [lead, ...list]);
          resetFilters();
          setSort({ key: "lastActivity", dir: "desc" });
          toast({ title: "Lead added", description: `${lead.name} from ${lead.company} is in your pipeline.`, action: { label: "Open", onClick: () => open(lead.id) } });
        }}
      />
    </div>
  );
}
