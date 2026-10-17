"use client";

import { Modal } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/feedback";

const shortcuts: { keys: string[]; label: string }[] = [
  { keys: ["⌘", "K"], label: "Open command menu" },
  { keys: ["["], label: "Collapse or expand sidebar" },
  { keys: ["G", "then", "D"], label: "Go to dashboard" },
  { keys: ["G", "then", "L"], label: "Go to leads" },
  { keys: ["G", "then", "A"], label: "Go to AI Mode" },
  { keys: ["?"], label: "Show keyboard shortcuts" },
  { keys: ["Esc"], label: "Close dialogs and panels" },
];

export function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Keyboard shortcuts" description="Move around the portal without leaving the keyboard." size="sm">
      <ul className="divide-y divide-line">
        {shortcuts.map((s) => (
          <li key={s.label} className="flex items-center justify-between py-2.5 text-[13px] text-fg-2">
            {s.label}
            <span className="flex items-center gap-1">
              {s.keys.map((k, i) => (k === "then" ? <span key={i} className="px-0.5 text-[11px] text-subtle">then</span> : <Kbd key={i}>{k}</Kbd>))}
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
