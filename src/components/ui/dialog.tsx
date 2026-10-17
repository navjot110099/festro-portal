"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" } as const;

interface BaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Hide the visual title (still announced to screen readers). */
  hideHeader?: boolean;
}

/** Centered modal. Focus trap, Escape and scroll-lock come from Radix; motion from Framer. */
export function Modal({ open, onOpenChange, title, description, children, footer, size = "md", className, hideHeader }: BaseProps & { size?: keyof typeof sizes }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[70] bg-overlay backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </DialogPrimitive.Overlay>
            <div className="fixed inset-0 z-[71] grid place-items-end overflow-y-auto sm:place-items-center sm:p-6">
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.98, transition: { duration: 0.16 } }}
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className={cn(
                    "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-lg sm:rounded-2xl",
                    sizes[size],
                    className,
                  )}
                >
                  <div className={cn("flex items-start justify-between gap-4 px-6 pt-5 pb-4", hideHeader && "sr-only")}>
                    <div className="min-w-0">
                      <DialogPrimitive.Title className="text-base font-semibold tracking-tight text-fg">{title}</DialogPrimitive.Title>
                      {description ? (
                        <DialogPrimitive.Description className="mt-1 text-[13px] text-muted">{description}</DialogPrimitive.Description>
                      ) : (
                        <DialogPrimitive.Description className="sr-only">{typeof title === "string" ? title : "Dialog"}</DialogPrimitive.Description>
                      )}
                    </div>
                  </div>
                  <DialogPrimitive.Close
                    className="absolute top-4 right-4 grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    aria-label="Close"
                  >
                    <X className="size-4" />
                  </DialogPrimitive.Close>
                  <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">{children}</div>
                  {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-line bg-surface-2/60 px-6 py-3.5">{footer}</div>}
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}

/** Side drawer (right on desktop, bottom sheet on phones). */
export function Drawer({ open, onOpenChange, title, description, children, footer, className, width = "max-w-xl" }: BaseProps & { width?: string }) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-[70] bg-overlay backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content asChild forceMount>
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
                transition={{ type: "spring", stiffness: 340, damping: 36 }}
                className={cn(
                  "fixed inset-y-0 right-0 z-[71] flex w-full flex-col border-l border-line bg-surface shadow-lg",
                  width,
                  className,
                )}
              >
                <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
                  <div className="min-w-0">
                    <DialogPrimitive.Title className="text-[15px] font-semibold tracking-tight text-fg">{title}</DialogPrimitive.Title>
                    {description ? (
                      <DialogPrimitive.Description className="mt-0.5 text-[12.5px] text-muted">{description}</DialogPrimitive.Description>
                    ) : (
                      <DialogPrimitive.Description className="sr-only">Details</DialogPrimitive.Description>
                    )}
                  </div>
                  <DialogPrimitive.Close
                    className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                    aria-label="Close panel"
                  >
                    <X className="size-4" />
                  </DialogPrimitive.Close>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
                {footer && <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2/60 px-6 py-3.5">{footer}</div>}
              </motion.aside>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
