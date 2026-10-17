"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** The Festro AI mark: a soft, slowly breathing wine orb. */
export function AiOrb({ size = "md", active = false, className }: { size?: "sm" | "md" | "lg"; active?: boolean; className?: string }) {
  const dims = { sm: "size-7", md: "size-9", lg: "size-16" }[size];
  const icon = { sm: "size-3.5", md: "size-4", lg: "size-7" }[size];
  return (
    <span className={cn("relative inline-grid shrink-0 place-items-center", dims, className)} aria-hidden>
      <motion.span
        className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,#8e263b,#c9798a,#541827,#e0697f,#8e263b)] opacity-90 blur-[1px]"
        animate={{ rotate: 360 }}
        transition={{ duration: active ? 3 : 14, repeat: Infinity, ease: "linear" }}
      />
      <span className="absolute inset-[2px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#a3304a,#351019_75%)]" />
      {size === "lg" && (
        <motion.span
          className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(224,105,127,0.28),transparent_65%)]"
          animate={{ scale: [1, 1.12, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <Sparkles className={cn("relative text-ivory", icon)} />
    </span>
  );
}
