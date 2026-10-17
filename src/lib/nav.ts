import {
  BriefcaseBusiness,
  ChartLine,
  FileChartColumn,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  Radar,
  Settings,
  Sparkles,
  SquareKanban,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
  /** Shown in the mobile bottom bar */
  primary?: boolean;
  badge?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/**
 * Navigation follows the product's information hierarchy:
 * performance first, growth engines second, operations and advanced tools last.
 */
export const navGroups: NavGroup[] = [
  {
    id: "performance",
    label: "Performance",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Business performance overview", primary: true },
      { href: "/analytics", label: "Analytics", icon: ChartLine, description: "Revenue, leads and conversion analytics", primary: true },
      { href: "/leads", label: "Leads", icon: UsersRound, description: "Pipeline and lead management", primary: true },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    items: [
      { href: "/ai", label: "AI Mode", icon: Sparkles, description: "Festro AI growth assistant", primary: true, badge: "AI" },
      { href: "/seo", label: "SEO & GEO", icon: Radar, description: "Search and AI visibility" },
      { href: "/campaigns", label: "Campaigns", icon: Megaphone, description: "Paid, organic and email campaigns" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { href: "/services", label: "Services", icon: Layers, description: "Your Festro growth stack" },
      { href: "/projects", label: "Projects", icon: BriefcaseBusiness, description: "Portfolio and client work" },
      { href: "/tasks", label: "Tasks", icon: SquareKanban, description: "Workflow and delivery board" },
      { href: "/reports", label: "Reports", icon: FileChartColumn, description: "Client report center" },
    ],
  },
];

export const utilityNav: NavItem[] = [
  { href: "/support", label: "Support", icon: LifeBuoy, description: "Help center and tickets" },
  { href: "/settings", label: "Settings", icon: Settings, description: "Workspace, appearance and integrations" },
];

export const allNavItems: NavItem[] = [...navGroups.flatMap((g) => g.items), ...utilityNav];

export function findNavItem(pathname: string) {
  return allNavItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
}
