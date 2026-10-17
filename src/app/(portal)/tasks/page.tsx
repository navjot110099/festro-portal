import type { Metadata } from "next";
import { Suspense } from "react";
import { TasksView } from "@/views/tasks-view";

export const metadata: Metadata = { title: "Tasks" };

export default function Page() {
  return (
    <Suspense>
      <TasksView />
    </Suspense>
  );
}
