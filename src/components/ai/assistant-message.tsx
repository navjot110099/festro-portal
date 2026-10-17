"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Copy, RotateCcw, ThumbsDown, ThumbsUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { Spinner } from "@/components/ui/feedback";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { AiBlock, AiResponse } from "@/types";
import { AiOrb } from "./ai-orb";
import { BlockView } from "./response-blocks";

const STEP_MS = 560;
const CHARS_PER_TICK = 3;
const TICK_MS = 14;

function blockToText(b: AiBlock): string {
  switch (b.type) {
    case "text":
    case "heading":
      return b.text.replace(/\*\*/g, "");
    case "bullets":
      return b.items.map((i) => `• ${i.replace(/\*\*/g, "")}`).join("\n");
    case "metrics":
      return b.items.map((m) => `${m.label}: ${m.value}${m.change ? ` (${m.change})` : ""}`).join("\n");
    case "table":
      return [b.columns.join(" | "), ...b.rows.map((r) => r.join(" | "))].join("\n");
    case "bars":
      return [b.title, ...b.items.map((i) => `${i.label}: ${i.display}`)].join("\n");
    case "callout":
      return `${b.title}: ${b.text}`;
    default:
      return "";
  }
}

/**
 * Renders an assistant turn progressively: reasoning steps, then each block in
 * order, typing text blocks character by character. `instant` (stop button,
 * reduced motion, or history) reveals everything at once.
 */
export function AssistantMessage({
  response,
  instant,
  onDone,
  onIntent,
  onRegenerate,
}: {
  response: AiResponse;
  instant: boolean;
  onDone: () => void;
  onIntent: (intent: string, label: string) => void;
  onRegenerate: () => void;
}) {
  const toast = useToast();
  const reduce = useReducedMotion();
  const skip = instant || Boolean(reduce);
  const [step, setStep] = useState(0);
  const [blockIndex, setBlockIndex] = useState(0);
  const [chars, setChars] = useState(0);
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const doneRef = useRef(false);

  const steps = response.thinking;
  const thinking = !skip && step < steps.length;
  const revealed = skip ? response.blocks.length : thinking ? 0 : blockIndex;
  const done = skip || (!thinking && blockIndex >= response.blocks.length);

  useEffect(() => {
    if (skip) return;
    if (step < steps.length) {
      const t = window.setTimeout(() => setStep((s) => s + 1), STEP_MS);
      return () => window.clearTimeout(t);
    }
    const block = response.blocks[blockIndex];
    if (!block) return;
    if (block.type === "text") {
      if (chars < block.text.length) {
        const t = window.setTimeout(() => setChars((c) => c + CHARS_PER_TICK), TICK_MS);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => {
        setBlockIndex((i) => i + 1);
        setChars(0);
      }, 120);
      return () => window.clearTimeout(t);
    }
    const delay = block.type === "bullets" ? 160 * block.items.length + 160 : block.type === "table" ? 380 : 300;
    const t = window.setTimeout(() => setBlockIndex((i) => i + 1), delay);
    return () => window.clearTimeout(t);
  }, [skip, step, steps.length, blockIndex, chars, response.blocks]);

  useEffect(() => {
    if (done && !doneRef.current) {
      doneRef.current = true;
      onDone();
    }
  }, [done, onDone]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(response.blocks.map(blockToText).filter(Boolean).join("\n\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: "Couldn't copy", description: "Your browser blocked clipboard access.", tone: "error" });
    }
  };

  const current = response.blocks[blockIndex];

  return (
    <div className="flex gap-3 sm:gap-4">
      <AiOrb size="sm" active={!done} className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-3.5">
        {/* Reasoning */}
        <AnimatePresence initial={false} mode="wait">
          {thinking ? (
            <motion.ol key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5 rounded-xl border border-line bg-surface-2/50 p-3" aria-label="FadHype AI is analysing">
              {steps.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: i <= step ? 1 : 0.35, x: 0 }}
                  className="flex items-center gap-2.5 text-[12.5px] text-fg-2"
                >
                  {i < step ? <Check className="size-3.5 text-success" aria-hidden /> : i === step ? <Spinner className="size-3.5 border-[1.5px] text-accent" /> : <span className="size-3.5 rounded-full border border-line-strong" aria-hidden />}
                  {s}
                </motion.li>
              ))}
            </motion.ol>
          ) : (
            <motion.details key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group text-[12px] text-muted">
              <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-md py-0.5 hover:text-fg [&::-webkit-details-marker]:hidden">
                <Check className="size-3.5 text-success" aria-hidden />
                Analysed {response.sources.length} {response.sources.length === 1 ? "source" : "sources"} in {steps.length} steps
                <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <ol className="mt-2 space-y-1 border-l border-line pl-3">
                {steps.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ol>
            </motion.details>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="space-y-3.5">
          {response.blocks.slice(0, revealed).map((b, i) => (
            <BlockView key={i} block={b} onIntent={onIntent} />
          ))}
          {!skip && !thinking && current && current.type === "text" && <BlockView block={current} typed={current.text.slice(0, chars)} onIntent={onIntent} />}
          {!skip && !thinking && current && current.type !== "text" && <BlockView block={current} onIntent={onIntent} />}
        </div>

        {/* Footer */}
        <AnimatePresence>
          {done && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
              <p className="text-[11.5px] text-subtle">Sources: {response.sources.join(" · ")}</p>
              <div className="flex items-center gap-0.5">
                <Tooltip content={copied ? "Copied" : "Copy answer"}>
                  <button type="button" onClick={copy} aria-label="Copy answer" className="grid size-7 place-items-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-fg">
                    {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                  </button>
                </Tooltip>
                <Tooltip content="Regenerate">
                  <button type="button" onClick={onRegenerate} aria-label="Regenerate answer" className="grid size-7 place-items-center rounded-md text-subtle transition-colors hover:bg-surface-2 hover:text-fg">
                    <RotateCcw className="size-3.5" />
                  </button>
                </Tooltip>
                {(["up", "down"] as const).map((f) => {
                  const Icon = f === "up" ? ThumbsUp : ThumbsDown;
                  return (
                    <button
                      key={f}
                      type="button"
                      aria-label={f === "up" ? "Helpful" : "Not helpful"}
                      aria-pressed={feedback === f}
                      onClick={() => {
                        setFeedback(f);
                        toast({ title: "Thanks for the feedback", description: "It helps FadHype AI tune answers to your business.", tone: "ai" });
                      }}
                      className={cn("grid size-7 place-items-center rounded-md transition-colors hover:bg-surface-2", feedback === f ? "text-accent-ink" : "text-subtle hover:text-fg")}
                    >
                      <Icon className="size-3.5" />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
