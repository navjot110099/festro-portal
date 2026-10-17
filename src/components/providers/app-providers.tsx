"use client";

import { Tooltip } from "radix-ui";
import { MotionProvider } from "./motion-provider";
import { ThemeProvider } from "./theme-provider";
import { ToastProvider } from "./toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <MotionProvider>
        <Tooltip.Provider delayDuration={250} skipDelayDuration={120}>
          <ToastProvider>{children}</ToastProvider>
        </Tooltip.Provider>
      </MotionProvider>
    </ThemeProvider>
  );
}
