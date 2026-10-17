"use client";

import { ArrowRight, BookOpen, CalendarDays, CircleCheck, Headphones, LifeBuoy, MessageSquare, Search, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Modal } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/feedback";
import { Field, Input, NativeSelect, Textarea } from "@/components/ui/input";
import { kbCategories } from "@/data/support";
import { accountManager, currentUser } from "@/data/user";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { formatRelative } from "@/lib/format";
import { cn, sleep } from "@/lib/utils";
import type { KnowledgeArticle, SupportTicket } from "@/types";

const ticketTone = { open: "info", "in-progress": "warning", resolved: "success" } as const;
const ticketLabel = { open: "Open", "in-progress": "In progress", resolved: "Resolved" } as const;

function TicketDialog({ open, onOpenChange, onCreate }: { open: boolean; onOpenChange: (v: boolean) => void; onCreate: (t: SupportTicket) => void }) {
  const ids = { subject: useId(), category: useId(), priority: useId(), body: useId() };
  const [form, setForm] = useState({ subject: "", category: "Analytics", priority: "normal" as SupportTicket["priority"], body: "" });
  const [errors, setErrors] = useState<{ subject?: string; body?: string }>({});
  const [saving, setSaving] = useState(false);

  const change = (v: boolean) => {
    if (v) {
      setForm({ subject: "", category: "Analytics", priority: "normal", body: "" });
      setErrors({});
    }
    onOpenChange(v);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (form.subject.trim().length < 4) errs.subject = "Add a short subject.";
    if (form.body.trim().length < 10) errs.body = "Tell us a little more (at least 10 characters).";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    await sleep(700);
    onCreate({ id: `FH-${2149 + Math.floor(Math.random() * 40)}`, subject: form.subject.trim(), category: form.category, priority: form.priority, status: "open", updatedAt: new Date().toISOString(), messages: 1 });
    setSaving(false);
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={change}
      title="Open a support ticket"
      description={`Typical first response: 12 minutes during business hours. ${accountManager.name} is notified too.`}
      footer={
        <>
          <Button variant="ghost" onClick={() => change(false)}>
            Cancel
          </Button>
          <Button type="submit" form="ticket-form" loading={saving}>
            Submit ticket
          </Button>
        </>
      }
    >
      <form id="ticket-form" onSubmit={submit} noValidate className="grid gap-4 pt-1 sm:grid-cols-2">
        <Field label="Subject" htmlFor={ids.subject} error={errors.subject} className="sm:col-span-2">
          <Input id={ids.subject} value={form.subject} autoFocus onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="e.g. LinkedIn conversions missing" aria-invalid={!!errors.subject || undefined} />
        </Field>
        <Field label="Category" htmlFor={ids.category}>
          <NativeSelect id={ids.category} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
            {[...kbCategories, "Billing", "Account"].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Priority" htmlFor={ids.priority}>
          <NativeSelect id={ids.priority} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as SupportTicket["priority"] }))}>
            <option value="low">Low: whenever you can</option>
            <option value="normal">Normal: within a day</option>
            <option value="high">High: blocking my work</option>
          </NativeSelect>
        </Field>
        <Field label="Details" htmlFor={ids.body} error={errors.body} className="sm:col-span-2">
          <Textarea id={ids.body} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} placeholder="What happened, and what did you expect?" aria-invalid={!!errors.body || undefined} />
        </Field>
      </form>
    </Modal>
  );
}

function ArticleDialog({ article, open, onOpenChange }: { article: KnowledgeArticle | null; open: boolean; onOpenChange: (v: boolean) => void }) {
  const toast = useToast();
  if (!article) return null;
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={article.title} description={`${article.category} · ${article.readTime} min read`} size="lg">
      <div className="space-y-4 pt-1 text-[14px] leading-relaxed text-fg-2">
        <p className="text-[15px] text-fg">{article.excerpt}</p>
        <p>
          Your FadHype portal combines data from every connected source into a single model, so the numbers you see on the dashboard, in reports and in AI answers always agree. When a platform reports a different figure, it is usually because of attribution windows or how conversions are de-duplicated across channels.
        </p>
        <h3 className="pt-2 text-[14px] font-semibold text-fg">Step by step</h3>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>Open Settings → Integrations and confirm the source shows “Connected”.</li>
          <li>Check the last sync time. Most sources refresh every 15 minutes.</li>
          <li>Ask FadHype AI to explain any number. It will show the sources it used.</li>
        </ol>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface-2 p-3.5">
          <p className="text-[13px]">Was this article helpful?</p>
          <div className="flex gap-2">
            {["Yes", "Not really"].map((a) => (
              <Button key={a} variant="secondary" size="sm" onClick={() => toast({ title: "Thanks for the feedback", tone: "info" })}>
                {a}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function SupportView() {
  const toast = useToast();
  const res = useResource(() => api.support.overview());
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [article, setArticle] = useState<KnowledgeArticle | null>(null);
  const [articleOpen, setArticleOpen] = useState(false);
  const searchId = useId();

  const articles = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (res.data?.articles ?? []).filter((a) => (!category || a.category === category) && (!q || `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(q)));
  }, [res.data, query, category]);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const options = [
    { title: "Help Center", desc: "Guides for every part of the portal", icon: LifeBuoy, onClick: () => scrollTo("knowledge-base") },
    { title: "Contact Support", desc: `Reach ${accountManager.name.split(" ")[0]} and the team`, icon: Headphones, onClick: () => scrollTo("contact-team") },
    { title: "AI Assistant", desc: "Instant answers from your data", icon: Sparkles, href: "/ai" },
    { title: "Open Ticket", desc: "Track a request end to end", icon: Ticket, onClick: () => setTicketOpen(true) },
    { title: "Knowledge Base", desc: "Concepts, metrics and best practice", icon: BookOpen, onClick: () => scrollTo("knowledge-base") },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="Help when you need it, from people and from AI." />

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_90%_at_100%_0%,var(--accent-soft),transparent_60%)]" aria-hidden />
        <div className="relative px-5 py-8 sm:px-10 sm:py-10">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-fg sm:text-[26px]">How can we help, {currentUser.firstName}?</h2>
          <p className="mt-1 text-[14px] text-muted">Search guides, or ask a question in plain English.</p>
          <form
            className="mt-5 flex max-w-2xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              scrollTo("knowledge-base");
            }}
          >
            <label htmlFor={searchId} className="sr-only">
              Search the help center
            </label>
            <Input id={searchId} type="search" inputSize="lg" leading={<Search />} placeholder="e.g. Why do Google Ads conversions differ?" value={query} onChange={(e) => setQuery(e.target.value)} className="bg-surface" />
            <Button asChild size="lg" variant="secondary">
              <Link href={`/ai${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`}>
                <Sparkles /> Ask AI
              </Link>
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[12px] text-muted">
            Popular:
            {["attribution", "GEO", "lead score", "reports"].map((p) => (
              <button key={p} type="button" onClick={() => setQuery(p)} className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-fg-2 transition-colors hover:border-line-strong hover:text-fg">
                {p}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {options.map((o, i) => {
          const inner = (
            <>
              <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent-ink transition-colors group-hover:bg-brand group-hover:text-brand-fg">
                <o.icon className="size-[18px]" aria-hidden />
              </span>
              <span className="mt-3 block text-[13.5px] font-semibold text-fg">{o.title}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-muted">{o.desc}</span>
            </>
          );
          const cls = "group block h-full rounded-2xl border border-line bg-surface p-4 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md";
          return (
            <li key={o.title} style={{ animationDelay: `${i * 50}ms` }} className={cn("animate-[rise_550ms_cubic-bezier(0.16,1,0.3,1)_backwards]", i === 4 && "col-span-2 md:col-span-1")}>
              {o.href ? (
                <Link href={o.href} className={cls}>
                  {inner}
                </Link>
              ) : (
                <button type="button" onClick={o.onClick} className={cn(cls, "w-full")}>
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card as="section" id="knowledge-base" aria-labelledby="kb-h" className="scroll-mt-24">
          <CardHeader titleId="kb-h" title="Knowledge base" description={query ? `${articles.length} results for “${query}”` : "Guides written by the FadHype team"} />
          <div className="flex gap-1.5 overflow-x-auto px-5 pt-4 scrollbar-none" role="group" aria-label="Filter by category">
            <button type="button" aria-pressed={!category} onClick={() => setCategory(null)} className={cn("shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors", !category ? "border-accent/30 bg-accent-soft text-accent-ink" : "border-line text-fg-2 hover:bg-surface-2")}>
              All
            </button>
            {kbCategories.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(category === c ? null : c)} className={cn("shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors", category === c ? "border-accent/30 bg-accent-soft text-accent-ink" : "border-line text-fg-2 hover:bg-surface-2")}>
                {c}
              </button>
            ))}
          </div>
          <div className="px-3 pt-3 pb-3">
            <AsyncView
              status={res.status}
              data={res.data}
              error={res.error}
              onRetry={res.reload}
              compact
              isEmpty={(d) => d.articles.length === 0}
              skeleton={
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              }
              empty={{ title: "Help articles unavailable", description: "Ask FadHype AI or open a ticket instead.", icon: BookOpen }}
            >
              {() =>
                articles.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-fg">No articles match “{query}”</p>
                    <p className="mt-1 text-[13px] text-muted">Try another term, or ask FadHype AI.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-line">
                    {articles.map((a) => (
                      <li key={a.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setArticle(a);
                            setArticleOpen(true);
                          }}
                          className="group flex w-full items-start gap-3 rounded-xl px-2 py-3 text-left transition-colors hover:bg-surface-2/60"
                        >
                          <BookOpen className="mt-0.5 size-4 shrink-0 text-subtle" aria-hidden />
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13.5px] font-medium text-fg group-hover:text-accent-ink">{a.title}</span>
                            <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{a.excerpt}</span>
                            <span className="mt-1 block text-[11.5px] text-subtle">
                              {a.category} · {a.readTime} min read
                            </span>
                          </span>
                          <ArrowRight className="mt-1 size-4 shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                )
              }
            </AsyncView>
          </div>
        </Card>

        <div className="space-y-4">
          <Card id="contact-team" className="scroll-mt-24 p-5">
            <p className="text-[11.5px] font-semibold tracking-[0.08em] text-accent-ink uppercase">Your account team</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="relative">
                <Avatar initials={accountManager.initials} hue={accountManager.hue} size="lg" />
                <span className="absolute right-0 bottom-0 size-3 rounded-full bg-success ring-2 ring-surface" aria-label="Online" />
              </div>
              <div>
                <p className="text-[14px] font-semibold text-fg">{accountManager.name}</p>
                <p className="text-[12px] text-muted">{accountManager.role} · usually replies in 12 min</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" onClick={() => toast({ title: "Message sent", description: `${accountManager.name} will reply here and by email.`, tone: "info" })}>
                <MessageSquare /> Message
              </Button>
              <Button variant="secondary" size="sm" onClick={() => toast({ title: "Call requested", description: "We'll send times for a 20-minute call.", tone: "info" })}>
                <CalendarDays /> Book a call
              </Button>
            </div>
            <Button className="mt-2 w-full" size="sm" onClick={() => setTicketOpen(true)}>
              <Ticket /> Open a ticket
            </Button>
          </Card>

          <Card as="section" aria-labelledby="tickets-h">
            <CardHeader titleId="tickets-h" title="Your tickets" />
            <div className="px-5 pt-3 pb-4">
              <AsyncView status={res.status} data={res.data} error={res.error} onRetry={res.reload} compact isEmpty={(d) => d.tickets.length === 0} skeleton={<Skeleton className="h-32 rounded-xl" />} empty={{ title: "No tickets", description: "Requests you open will show up here.", icon: Ticket }}>
                {(d) => (
                  <ul className="divide-y divide-line">
                    {d.tickets.map((t) => (
                      <li key={t.id} className="py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[13px] font-medium text-fg">{t.subject}</p>
                          <Badge tone={ticketTone[t.status]}>{ticketLabel[t.status]}</Badge>
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-muted">
                          <span className="font-mono">{t.id}</span> · {t.category} · updated {formatRelative(t.updatedAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </AsyncView>
            </div>
          </Card>

          <Card as="section" aria-labelledby="status-h" className="p-5">
            <div className="flex items-center justify-between">
              <h2 id="status-h" className="text-[14px] font-semibold text-fg">
                System status
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-success">
                <CircleCheck className="size-3.5" aria-hidden /> All systems operational
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {(res.data?.status ?? []).map((s) => (
                <li key={s.id} className="flex items-center justify-between text-[12.5px]">
                  <span className="text-fg-2">{s.label}</span>
                  <span className="flex items-center gap-1.5 text-muted">
                    <span className="size-1.5 rounded-full bg-success" aria-hidden /> Operational
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <TicketDialog
        open={ticketOpen}
        onOpenChange={setTicketOpen}
        onCreate={(t) => {
          res.setData((d) => ({ ...d, tickets: [t, ...d.tickets] }));
          toast({ title: `Ticket ${t.id} opened`, description: "We'll reply by email and in this portal." });
        }}
      />
      <ArticleDialog article={article} open={articleOpen} onOpenChange={setArticleOpen} />
    </div>
  );
}
