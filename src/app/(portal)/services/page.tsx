import type { Metadata } from "next";
import { ServicesView } from "@/views/services-view";

export const metadata: Metadata = { title: "Services" };

export default function Page() {
  return <ServicesView />;
}
