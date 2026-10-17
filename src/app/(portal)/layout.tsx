import type { Metadata } from "next";
import { AppShell } from "@/layouts/app-shell";

/** The authenticated portal is private: never indexed, always behind the proxy session check. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
