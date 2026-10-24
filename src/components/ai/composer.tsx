"use client";

import { ArrowUp, Square } from "lucide-react";
import { useId, useRef } from "react";
import { cn } from "@/lib/utils";

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  generating,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  generating: boolean;
  disabled?: boolean;
}) {
  const id = useId();
  const ref = useRef<HTMLTextAreaElement>(null);

  const resize = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 168)}px`;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!generating && value.trim()) onSubmit();
      }}
      className="rounded-2xl border border-line bg-surface p-2 shadow-sm transition-[border-color,box-shadow] focus-within:border-accent/40 focus-within:shadow-md focus-within:ring-4 focus-within:ring-accent-soft"
    >
      <label htmlFor={id} className="sr-only">
        Message Festro AI
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id={id}
          ref={ref}
          rows={1}
          value={value}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            resize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (!generating && value.trim()) {
                onSubmit();
                requestAnimationFrame(resize);
              }
            }
          }}
          placeholder="Ask about revenue, leads, SEO…"
          className="max-h-42 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] leading-relaxed text-fg outline-none placeholder:text-subtle focus-visible:outline-none"
        />
        {generating ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="mb-0.5 grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-fg transition-colors hover:bg-surface-3"
          >
            <Square className="size-3.5 fill-current" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim() || disabled}
            aria-label="Send message"
            className={cn(
              "mb-0.5 grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-200 active:scale-95",
              value.trim() ? "bg-brand text-brand-fg shadow-brand hover:bg-brand-hover" : "bg-surface-3 text-subtle",
            )}
          >
            <ArrowUp className="size-4" />
          </button>
        )}
      </div>
    </form>
  );
}
