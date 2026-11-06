"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PenSquare } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AiOrb } from "@/components/ai/ai-orb";
import { AssistantMessage } from "@/components/ai/assistant-message";
import { Composer } from "@/components/ai/composer";
import { ContextPanel } from "@/components/ai/context-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/states";
import { DataIcon } from "@/components/ui/icon";
import { capabilities, quickActions, type AiIntent } from "@/data/ai";
import { askAssistant } from "@/lib/ai/engine";
import { uid } from "@/lib/utils";
import type { AiResponse } from "@/types";

interface Turn {
  id: string;
  prompt: string;
  intent?: AiIntent;
  status: "pending" | "ready" | "error";
  response?: AiResponse;
  error?: string;
  /** Reveal instantly (stopped by the user). */
  instant?: boolean;
}

const intents: AiIntent[] = ["revenue", "growth", "leads", "seo", "report", "campaigns", "website", "ideas", "forecast", "conversion", "summary"];
const isIntent = (v: string | null): v is AiIntent => !!v && (intents as string[]).includes(v);

function initialTurns(q: string | null, intent: string | null): Turn[] {
  if (q) return [{ id: uid("turn"), prompt: q, status: "pending" }];
  if (isIntent(intent)) {
    const qa = quickActions.find((a) => a.id === intent);
    return [{ id: uid("turn"), prompt: qa?.prompt ?? capabilities.find((c) => c.intent === intent)?.prompt ?? "Summarize my analytics", intent, status: "pending" }];
  }
  return [];
}

function EmptyConversation({ onPick }: { onPick: (prompt: string, intent?: AiIntent) => void }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-2 py-8 text-center sm:py-14">
      <AiOrb size="lg" />
      <h2 className="mt-7 text-[24px] leading-tight font-semibold tracking-[-0.03em] text-fg sm:text-[28px]">How can I help you grow today?</h2>
      <p className="mt-2 max-w-md text-[14px] text-muted">
        I analyse your revenue, leads, campaigns and search data, and tell you what to do next.
      </p>
      <div className="mt-8 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((a, i) => (
          <button
            key={a.id}
            type="button"
            style={{ animationDelay: `${100 + i * 50}ms` }}
            onClick={() => onPick(a.prompt, a.id)}
            className="animate-[rise_550ms_cubic-bezier(0.16,1,0.3,1)_backwards] group flex items-center gap-3 rounded-xl border border-line bg-surface p-3 text-left shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-md"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent-ink transition-colors group-hover:bg-brand group-hover:text-brand-fg">
              <DataIcon name={a.icon} className="size-4" />
            </span>
            <span className="text-[13px] font-medium text-fg">{a.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-8 w-full text-left">
        <p className="mb-2.5 text-center text-[11.5px] font-medium tracking-[0.08em] text-subtle uppercase">Or ask about</p>
        <div className="flex flex-wrap justify-center gap-1.5">
          {capabilities.map((c) => (
            <button
              key={c.title}
              type="button"
              onClick={() => onPick(c.prompt, c.intent)}
              className="rounded-full border border-line bg-surface-2/50 px-3 py-1.5 text-[12px] text-fg-2 transition-colors hover:border-line-strong hover:bg-surface hover:text-fg"
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AiView() {
  const params = useSearchParams();
  const router = useRouter();
  const [turns, setTurns] = useState<Turn[]>(() => initialTurns(params.get("q"), params.get("intent")));
  const [animating, setAnimating] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  const pending = turns.find((t) => t.status === "pending");
  const generating = Boolean(pending) || animating !== null;

  // Resolve pending turns against the assistant engine.
  useEffect(() => {
    if (!pending) return;
    let cancelled = false;
    askAssistant(pending.prompt, pending.intent)
      .then(({ intent, response }) => {
        if (cancelled) return;
        setTurns((ts) => ts.map((t) => (t.id === pending.id ? { ...t, intent, status: "ready", response } : t)));
        setAnimating(pending.id);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setTurns((ts) => ts.map((t) => (t.id === pending.id ? { ...t, status: "error", error: err instanceof Error ? err.message : "Something went wrong." } : t)));
      });
    return () => {
      cancelled = true;
    };
  }, [pending]);

  // Clear deep-link params once consumed so refresh doesn't re-ask.
  useEffect(() => {
    if (params.get("q") || params.get("intent")) router.replace("/ai", { scroll: false });
  }, [params, router]);

  // Keep the newest content in view while streaming, unless the user scrolled up.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let raf = 0;
    const loop = () => {
      if (stickToBottom.current) el.scrollTop = el.scrollHeight;
      raf = requestAnimationFrame(loop);
    };
    if (generating) raf = requestAnimationFrame(loop);
    else if (stickToBottom.current) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    return () => cancelAnimationFrame(raf);
  }, [generating, turns.length]);

  const ask = useCallback((prompt: string, intent?: AiIntent) => {
    if (!prompt.trim()) return;
    stickToBottom.current = true;
    setTurns((ts) => [...ts, { id: uid("turn"), prompt: prompt.trim(), intent, status: "pending" }]);
    setDraft("");
  }, []);

  const stop = () => {
    if (animating) setTurns((ts) => ts.map((t) => (t.id === animating ? { ...t, instant: true } : t)));
    setAnimating(null);
  };

  const onDone = useCallback((id: string) => setAnimating((a) => (a === id ? null : a)), []);

  const regenerate = (turn: Turn) => {
    stickToBottom.current = true;
    setTurns((ts) => ts.map((t) => (t.id === turn.id ? { ...t, id: uid("turn"), status: "pending", response: undefined, instant: false } : t)));
  };

  const onIntent = (intent: string, label: string) => {
    const qa = quickActions.find((q) => q.id === intent);
    ask(qa?.prompt ?? label, intent as AiIntent);
  };

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
      <Card as="section" aria-labelledby="ai-title" className="flex h-[calc(100dvh-12.5rem)] min-h-[520px] flex-col overflow-hidden lg:h-[calc(100dvh-9.5rem)]">
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <AiOrb size="md" active={generating} />
            <div className="min-w-0">
              <h1 id="ai-title" className="text-[15px] font-semibold tracking-tight text-fg">
                Festro AI
              </h1>
              <p className="truncate text-[12px] text-muted">Your intelligent growth assistant.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium text-muted md:inline-flex">
              <span className="size-1.5 rounded-full bg-success" aria-hidden /> Growth model · 7 sources
            </span>
            <Button variant="secondary" size="sm" onClick={() => {
                setTurns([]);
                setAnimating(null);
              }} disabled={turns.length === 0}>
              <PenSquare /> New chat
            </Button>
          </div>
        </header>

        <div
          ref={scrollRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          role="log"
          aria-live="polite"
          aria-busy={generating}
          aria-label="Conversation"
          className="min-h-0 flex-1 overflow-y-auto px-4 sm:px-6"
        >
          {turns.length === 0 ? (
            <EmptyConversation onPick={ask} />
          ) : (
            <div className="mx-auto max-w-3xl space-y-8 py-6">
              <AnimatePresence initial={false}>
                {turns.map((t) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                    <div className="flex justify-end">
                      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-[14px] leading-relaxed text-brand-fg shadow-xs">{t.prompt}</p>
                    </div>
                    {t.status === "pending" && (
                      <div className="flex items-center gap-3" aria-label="Connecting to your workspace">
                        <AiOrb size="sm" active />
                        <div className="flex items-center gap-2 text-[12.5px] text-muted">
                          <span className="skeleton h-3 w-44" /> Connecting to your workspace…
                        </div>
                      </div>
                    )}
                    {t.status === "error" && (
                      <div className="rounded-xl border border-line bg-surface-2/50">
                        <ErrorState compact title="Festro AI couldn't answer" error={new Error(t.error)} onRetry={() => regenerate(t)} />
                      </div>
                    )}
                    {t.status === "ready" && t.response && (
                      <AssistantMessage
                        response={t.response}
                        instant={Boolean(t.instant) || animating !== t.id}
                        onDone={() => onDone(t.id)}
                        onIntent={onIntent}
                        onRegenerate={() => regenerate(t)}
                      />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="border-t border-line bg-surface px-3 pt-3 pb-3 sm:px-5">
          {turns.length > 0 && (
            <div className="-mx-1 mb-2.5 flex gap-1.5 overflow-x-auto px-1 scrollbar-none">
              {quickActions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  disabled={generating}
                  onClick={() => ask(a.prompt, a.id)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface-2/50 px-2.5 py-1 text-[12px] text-fg-2 transition-colors hover:border-line-strong hover:text-fg disabled:opacity-50"
                >
                  <DataIcon name={a.icon} className="size-3 text-accent-ink" /> {a.label}
                </button>
              ))}
            </div>
          )}
          <div className="mx-auto max-w-3xl">
            <Composer value={draft} onChange={setDraft} onSubmit={() => ask(draft)} onStop={stop} generating={generating} />
            <p className="mt-2 text-center text-[11px] text-subtle">Festro AI reads your connected data. It never changes anything without your approval.</p>
          </div>
        </div>
      </Card>

      <div className="hidden xl:block">
        <div className="sticky top-24 max-h-[calc(100dvh-9.5rem)] overflow-y-auto">
          <ContextPanel onPrompt={(p) => ask(p)} />
        </div>
      </div>
    </div>
  );
}
