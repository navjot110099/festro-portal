import type { Task, TaskPriority, TaskStatus } from "@/types";

export const taskColumns: { id: TaskStatus; label: string; hint: string }[] = [
  { id: "todo", label: "To do", hint: "Planned and prioritised" },
  { id: "in-progress", label: "In progress", hint: "Actively being worked" },
  { id: "review", label: "In review", hint: "Awaiting your approval" },
  { id: "done", label: "Done", hint: "Shipped this cycle" },
];

export const priorityMeta: Record<TaskPriority, { label: string; rank: number }> = {
  urgent: { label: "Urgent", rank: 0 },
  high: { label: "High", rank: 1 },
  medium: { label: "Medium", rank: 2 },
  low: { label: "Low", rank: 3 },
};

const day = 86_400_000;

/** Tasks with due dates relative to "now" so the board always looks current. */
export function buildTasks(now = Date.now()): Task[] {
  const due = (days: number) => new Date(now + days * day).toISOString();
  return [
    { id: "t1", title: "Launch SEO content cluster", description: "Publish the 6-article “team headshots” cluster with internal links to the service page.", status: "in-progress", priority: "high", tag: "SEO", assignees: ["tm_sofia"], due: due(3), progress: 0.62, subtasks: { done: 4, total: 7 }, comments: 6 },
    { id: "t2", title: "Optimize Meta campaign", description: "Shift budget from Reels awareness (1.7x) into the consultation lead form (3.7x).", status: "todo", priority: "urgent", tag: "Paid Media", assignees: ["tm_marcus"], due: due(1), progress: 0.1, subtasks: { done: 1, total: 5 }, comments: 3 },
    { id: "t3", title: "Review qualified leads", description: "38 qualified leads are waiting more than 24h for first contact.", status: "todo", priority: "high", tag: "CRM", assignees: ["tm_priya", "tm_deep"], due: due(0), progress: 0, subtasks: { done: 0, total: 3 }, comments: 2 },
    { id: "t4", title: "Prepare monthly client report", description: "October performance report with GEO section and Q4 forecast.", status: "review", priority: "medium", tag: "Reporting", assignees: ["tm_aanya"], due: due(2), progress: 0.9, subtasks: { done: 9, total: 10 }, comments: 4 },
    { id: "t5", title: "Comparison page: on-location vs studio", description: "Brief, write and publish — target the prompt where the brand is absent.", status: "todo", priority: "medium", tag: "Content", assignees: ["tm_sofia"], due: due(6), progress: 0, subtasks: { done: 0, total: 4 }, comments: 1 },
    { id: "t6", title: "Fix mobile LCP on two service pages", description: "Hero images on /event-coverage and /executive-portraits exceed 2.5s.", status: "in-progress", priority: "high", tag: "Web", assignees: ["tm_ethan"], due: due(2), progress: 0.45, subtasks: { done: 2, total: 4 }, comments: 5 },
    { id: "t7", title: "Lead qualification agent — training set", description: "Label 200 historical enquiries for the AI qualification agent.", status: "in-progress", priority: "medium", tag: "Automation", assignees: ["tm_aanya", "tm_ethan"], due: due(5), progress: 0.34, subtasks: { done: 3, total: 9 }, comments: 7 },
    { id: "t8", title: "LinkedIn HR leaders creative refresh", description: "Three new carousel variants for the headshot-day campaign.", status: "review", priority: "medium", tag: "Paid Media", assignees: ["tm_marcus"], due: due(1), progress: 0.85, subtasks: { done: 5, total: 6 }, comments: 9 },
    { id: "t9", title: "Publish per-person pricing table", status: "todo", priority: "low", tag: "Web", assignees: ["tm_ethan"], due: due(9), progress: 0, subtasks: { done: 0, total: 2 }, comments: 0 },
    { id: "t10", title: "Q4 nurture sequence — email 3", status: "done", priority: "medium", tag: "Automation", assignees: ["tm_aanya"], due: due(-2), progress: 1, subtasks: { done: 4, total: 4 }, comments: 3 },
    { id: "t11", title: "Search Console coverage fixes", status: "done", priority: "low", tag: "SEO", assignees: ["tm_sofia"], due: due(-4), progress: 1, subtasks: { done: 6, total: 6 }, comments: 1 },
    { id: "t12", title: "Offline conversion import (Google Ads)", status: "done", priority: "high", tag: "Paid Media", assignees: ["tm_marcus", "tm_ethan"], due: due(-6), progress: 1, subtasks: { done: 5, total: 5 }, comments: 4 },
    { id: "t13", title: "Schema: Service + FAQ for event coverage", status: "todo", priority: "medium", tag: "SEO", assignees: ["tm_sofia", "tm_ethan"], due: due(4), progress: 0, subtasks: { done: 0, total: 3 }, comments: 0 },
  ];
}
