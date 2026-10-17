import type { Metadata } from "next";
import { ProjectsView } from "@/views/projects-view";

export const metadata: Metadata = { title: "Projects" };

export default function Page() {
  return <ProjectsView />;
}
