import type { Metadata } from "next";
import { SupportView } from "@/views/support-view";

export const metadata: Metadata = { title: "Support" };

export default function Page() {
  return <SupportView />;
}
