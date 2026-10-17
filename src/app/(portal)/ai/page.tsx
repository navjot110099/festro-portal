import type { Metadata } from "next";
import { Suspense } from "react";
import { AiView } from "@/views/ai-view";

export const metadata: Metadata = { title: "AI Mode" };

export default function Page() {
  return (
    <Suspense>
      <AiView />
    </Suspense>
  );
}
