"use client";

import { motion } from "framer-motion";
import { Check, Database, FlaskConical, LogOut, Monitor, Moon, ShieldCheck, Smartphone, Sun, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, useSyncExternalStore } from "react";
import { useMotionPreference } from "@/components/providers/motion-provider";
import { useTheme, type ThemePreference } from "@/components/providers/theme-provider";
import { useToast } from "@/components/providers/toast-provider";
import { AsyncView } from "@/components/shared/async-view";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/feedback";
import { Field, Input, NativeSelect } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { currentUser, team } from "@/data/user";
import { useResource } from "@/hooks/use-resource";
import { api } from "@/lib/api";
import { DEMO_MODE_EVENT, getDemoMode, setDemoMode, type DemoMode } from "@/lib/api/client";
import { signOut } from "@/lib/auth";
import { cn, sleep } from "@/lib/utils";

function Section({ title, description, children, footer }: { title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <Card as="section" className="overflow-hidden">
      <div className="grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div>
          <h2 className="text-[14.5px] font-semibold tracking-tight text-fg">{title}</h2>
          {description && <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{description}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
      {footer && <div className="flex justify-end gap-2 border-t border-line bg-surface-2/50 px-5 py-3 sm:px-6">{footer}</div>}
    </Card>
  );
}

function ToggleRow({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div>
        <p className="text-[13.5px] font-medium text-fg">{title}</p>
        <p className="mt-0.5 text-[12.5px] text-muted">{description}</p>
      </div>
      <Switch label={title} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ThemePreview({ mode }: { mode: "light" | "dark" }) {
  const dark = mode === "dark";
  return (
    <div className={cn("flex h-20 overflow-hidden rounded-lg border", dark ? "border-[#2c2026] bg-[#0e0a0c]" : "border-[#e9e0d4] bg-[#f7f3ed]")} aria-hidden>
      <div className={cn("w-1/4 space-y-1.5 border-r p-2", dark ? "border-[#2c2026] bg-[#120c0f]" : "border-[#e9e0d4] bg-[#fbf8f3]")}>
        <span className="block h-1.5 w-3/4 rounded-full bg-[#8e263b]" />
        {[0, 1, 2].map((i) => (
          <span key={i} className={cn("block h-1 rounded-full", dark ? "bg-white/15" : "bg-black/10")} />
        ))}
      </div>
      <div className="flex-1 space-y-1.5 p-2">
        <div className="grid grid-cols-2 gap-1.5">
          {[0, 1].map((i) => (
            <div key={i} className={cn("h-6 rounded-md border", dark ? "border-[#2c2026] bg-[#1a1216]" : "border-[#e9e0d4] bg-white")} />
          ))}
        </div>
        <div className={cn("h-7 rounded-md border", dark ? "border-[#2c2026] bg-[#1a1216]" : "border-[#e9e0d4] bg-white")}>
          <svg viewBox="0 0 100 20" className="h-full w-full" preserveAspectRatio="none">
            <path d="M0 16 C 20 14, 30 10, 50 9 S 80 4, 100 3" fill="none" stroke={dark ? "#d9566f" : "#9b2c45"} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          </svg>
        </div>
      </div>
    </div>
  );
}

const demoModes: { value: DemoMode; title: string; description: string; icon: React.ElementType }[] = [
  { value: "live", title: "Live demo data", description: "A fully populated workspace with realistic, illustrative data.", icon: Database },
  { value: "empty", title: "Empty workspace", description: "Preview every section before any data source is connected.", icon: FlaskConical },
  { value: "error", title: "Simulate outages", description: "Preview error states and retry behaviour across the portal.", icon: TriangleAlert },
];

function subscribeDemo(cb: () => void) {
  window.addEventListener(DEMO_MODE_EVENT, cb);
  return () => window.removeEventListener(DEMO_MODE_EVENT, cb);
}

export function SettingsView() {
  const toast = useToast();
  const router = useRouter();
  const { preference, setTheme } = useTheme();
  const { reduced, setReduced } = useMotionPreference();
  const demoMode = useSyncExternalStore(subscribeDemo, getDemoMode, () => "live" as DemoMode);
  const integrations = useResource(() => api.integrations.list());
  const [tab, setTab] = useState("profile");
  const [saving, setSaving] = useState(false);
  const ids = { name: useId(), email: useId(), role: useId(), ws: useId(), url: useId(), tz: useId(), cur: useId() };
  const [profile, setProfile] = useState({ name: currentUser.name, email: currentUser.email });
  const [notify, setNotify] = useState({ leads: true, ai: true, anomalies: true, reports: true, digest: false, sms: false });
  const [twoFactor, setTwoFactor] = useState(true);

  const save = async (what: string) => {
    setSaving(true);
    await sleep(600);
    setSaving(false);
    toast({ title: "Changes saved", description: what });
  };

  const tabs = [
    { value: "profile", label: "Profile" },
    { value: "workspace", label: "Workspace" },
    { value: "appearance", label: "Appearance" },
    { value: "notifications", label: "Notifications" },
    { value: "integrations", label: "Integrations" },
    { value: "data", label: "Demo data" },
    { value: "security", label: "Security" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your profile, workspace, appearance and connected data." />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList label="Settings sections" value={tab} items={tabs} />

        <TabsContent value="profile" className="mt-6 space-y-4 outline-none">
          <Section
            title="Profile"
            description="How you appear to your FadHype team."
            footer={
              <Button onClick={() => save("Your profile was updated.")} loading={saving}>
                Save profile
              </Button>
            }
          >
            <div className="mb-5 flex items-center gap-4">
              <Avatar initials={currentUser.initials} hue={348} size="xl" />
              <div>
                <p className="text-[14px] font-semibold text-fg">{profile.name}</p>
                <p className="text-[12.5px] text-muted">
                  {currentUser.role} · {currentUser.workspace}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Display name" htmlFor={ids.name}>
                <Input id={ids.name} value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
              </Field>
              <Field label="Email" htmlFor={ids.email}>
                <Input id={ids.email} type="email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
              </Field>
              <Field label="Role" htmlFor={ids.role} hint="Owners can manage billing, members and integrations.">
                <Input id={ids.role} value={currentUser.role} disabled />
              </Field>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="workspace" className="mt-6 space-y-4 outline-none">
          <Section
            title="Workspace"
            description="Business details used across dashboards and client reports."
            footer={
              <Button onClick={() => save("Workspace details updated.")} loading={saving}>
                Save workspace
              </Button>
            }
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Business name" htmlFor={ids.ws}>
                <Input id={ids.ws} defaultValue={currentUser.workspace} />
              </Field>
              <Field label="Website" htmlFor={ids.url}>
                <Input id={ids.url} defaultValue="https://meridian.studio" />
              </Field>
              <Field label="Time zone" htmlFor={ids.tz}>
                <NativeSelect id={ids.tz} defaultValue="America/Chicago">
                  <option value="America/New_York">Eastern (New York)</option>
                  <option value="America/Chicago">Central (Chicago)</option>
                  <option value="America/Los_Angeles">Pacific (Los Angeles)</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Kolkata">India (Kolkata)</option>
                </NativeSelect>
              </Field>
              <Field label="Reporting currency" htmlFor={ids.cur}>
                <NativeSelect id={ids.cur} defaultValue="USD">
                  <option>USD</option>
                  <option>EUR</option>
                  <option>GBP</option>
                  <option>CAD</option>
                  <option>INR</option>
                </NativeSelect>
              </Field>
            </div>
          </Section>
          <Section title="Team" description="People with access to this workspace.">
            <ul className="divide-y divide-line">
              {team.map((m) => (
                <li key={m.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <Avatar initials={m.initials} hue={m.hue} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-medium text-fg">{m.name}</p>
                    <p className="truncate text-[12px] text-muted">{m.email}</p>
                  </div>
                  <Badge tone={m.id === "tm_deep" ? "brand" : "neutral"}>{m.id === "tm_deep" ? "Owner" : "FadHype team"}</Badge>
                </li>
              ))}
            </ul>
          </Section>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6 space-y-4 outline-none">
          <Section title="Theme" description="Your choice is saved on this device. System follows your OS setting.">
            <div role="radiogroup" aria-label="Theme" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(
                [
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                  { value: "system", label: "System", icon: Monitor },
                ] as { value: ThemePreference; label: string; icon: React.ElementType }[]
              ).map((t) => {
                const active = preference === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={(e) => {
                      const r = e.currentTarget.getBoundingClientRect();
                      setTheme(t.value, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
                    }}
                    className={cn("relative rounded-xl border p-2.5 text-left transition-all", active ? "border-accent/40 ring-4 ring-accent-soft" : "border-line hover:border-line-strong")}
                  >
                    {t.value === "system" ? (
                      <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-lg">
                        <ThemePreview mode="light" />
                        <ThemePreview mode="dark" />
                      </div>
                    ) : (
                      <ThemePreview mode={t.value as "light" | "dark"} />
                    )}
                    <span className="mt-2.5 flex items-center justify-between px-0.5">
                      <span className="flex items-center gap-2 text-[13px] font-medium text-fg">
                        <t.icon className="size-4 text-muted" aria-hidden /> {t.label}
                      </span>
                      {active && (
                        <motion.span layoutId="theme-check" className="grid size-5 place-items-center rounded-full bg-brand text-brand-fg">
                          <Check className="size-3" aria-hidden />
                        </motion.span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section title="Motion" description="FadHype respects your system's reduced-motion setting automatically.">
            <ToggleRow
              title="Reduce motion"
              description="Turn off count-ups, chart animations and decorative movement in this browser."
              checked={reduced}
              onChange={(v) => {
                setReduced(v);
                toast({ title: v ? "Reduced motion on" : "Animations on", tone: "info" });
              }}
            />
          </Section>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6 space-y-4 outline-none">
          <Section
            title="Notifications"
            description="Choose what reaches you, and where."
            footer={
              <Button onClick={() => save("Notification preferences updated.")} loading={saving}>
                Save preferences
              </Button>
            }
          >
            <div className="divide-y divide-line">
              <ToggleRow title="New qualified leads" description="Instant alert when a lead scores 80 or higher." checked={notify.leads} onChange={(v) => setNotify((n) => ({ ...n, leads: v }))} />
              <ToggleRow title="AI growth opportunities" description="When FadHype AI finds an opportunity worth more than $500." checked={notify.ai} onChange={(v) => setNotify((n) => ({ ...n, ai: v }))} />
              <ToggleRow title="Campaign anomalies" description="Spend spikes, ROAS drops, or disapproved ads." checked={notify.anomalies} onChange={(v) => setNotify((n) => ({ ...n, anomalies: v }))} />
              <ToggleRow title="Reports ready" description="When a scheduled or requested report is generated." checked={notify.reports} onChange={(v) => setNotify((n) => ({ ...n, reports: v }))} />
              <ToggleRow title="Weekly digest" description="A Monday summary of performance and next actions." checked={notify.digest} onChange={(v) => setNotify((n) => ({ ...n, digest: v }))} />
              <ToggleRow title="SMS for urgent alerts" description="Only for outages or campaigns that stop delivering." checked={notify.sms} onChange={(v) => setNotify((n) => ({ ...n, sms: v }))} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6 space-y-4 outline-none">
          <Section title="Integrations" description="Read-only connections that power dashboards, reports and FadHype AI.">
            <AsyncView
              status={integrations.status}
              data={integrations.data}
              error={integrations.error}
              onRetry={integrations.reload}
              compact
              skeleton={
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              }
              empty={{ title: "No integrations available", icon: Database }}
            >
              {(list) => (
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {list.map((i) => (
                    <li key={i.id} className="flex items-start gap-3 rounded-xl border border-line p-3.5">
                      <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg text-[12px] font-semibold", i.connected ? "bg-success-soft text-success" : "bg-surface-3 text-muted")}>
                        {i.name
                          .split(/\s|\//)
                          .filter(Boolean)
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[13px] font-medium text-fg">{i.name}</p>
                        </div>
                        <p className="text-[12px] text-muted">{i.description}</p>
                        <p className="mt-1 text-[11.5px] text-subtle">{i.connected ? `Connected · synced ${i.lastSync}` : i.category}</p>
                      </div>
                      <Button
                        variant={i.connected ? "ghost" : "secondary"}
                        size="xs"
                        onClick={() => {
                          integrations.setData((all) => all.map((x) => (x.id === i.id ? { ...x, connected: !x.connected, lastSync: x.connected ? undefined : "just now" } : x)));
                          toast({ title: i.connected ? `${i.name} disconnected` : `${i.name} connected`, tone: i.connected ? "info" : "success" });
                        }}
                      >
                        {i.connected ? "Disconnect" : "Connect"}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </AsyncView>
          </Section>
        </TabsContent>

        <TabsContent value="data" className="mt-6 space-y-4 outline-none">
          <Section title="Demo data mode" description="This portfolio build runs on a mock data layer. Switch modes to preview how every section handles empty and error states.">
            <div role="radiogroup" aria-label="Demo data mode" className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {demoModes.map((m) => {
                const active = demoMode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => {
                      setDemoMode(m.value);
                      toast({ title: `${m.title} enabled`, description: "Every page will reload its data in this mode.", tone: m.value === "error" ? "error" : "info" });
                    }}
                    className={cn("rounded-xl border p-4 text-left transition-all", active ? "border-accent/40 bg-accent-soft ring-4 ring-accent-soft" : "border-line hover:border-line-strong hover:bg-surface-2/60")}
                  >
                    <span className="flex items-center justify-between">
                      <m.icon className={cn("size-5", active ? "text-accent-ink" : "text-muted")} aria-hidden />
                      {active && <Check className="size-4 text-accent-ink" aria-hidden />}
                    </span>
                    <span className="mt-3 block text-[13.5px] font-semibold text-fg">{m.title}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{m.description}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-[12px] text-subtle">
              Production wiring: replace the resolvers in <code className="font-mono text-fg-2">src/lib/api</code> with REST, Supabase or CRM calls. No component changes are needed.
            </p>
          </Section>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4 outline-none">
          <Section title="Sign-in security">
            <ToggleRow
              title="Two-factor authentication"
              description="Require a one-time code from an authenticator app when signing in."
              checked={twoFactor}
              onChange={(v) => {
                setTwoFactor(v);
                toast({ title: v ? "Two-factor enabled" : "Two-factor disabled", tone: v ? "success" : "info" });
              }}
            />
          </Section>
          <Section title="Active sessions" description="Devices currently signed in to this workspace.">
            <ul className="divide-y divide-line">
              {[
                { icon: Monitor, name: "MacBook Pro · Chrome", meta: "This device · active now", current: true },
                { icon: Smartphone, name: "iPhone · Safari", meta: "Last active 2 hours ago", current: false },
              ].map((s) => (
                <li key={s.name} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="grid size-9 place-items-center rounded-lg bg-surface-2 text-muted">
                    <s.icon className="size-4" aria-hidden />
                  </span>
                  <div className="flex-1">
                    <p className="text-[13.5px] font-medium text-fg">{s.name}</p>
                    <p className="text-[12px] text-muted">{s.meta}</p>
                  </div>
                  {s.current ? <Badge tone="success" dot>Current</Badge> : <Button variant="ghost" size="xs" onClick={() => toast({ title: "Session ended", description: s.name, tone: "info" })}>Revoke</Button>}
                </li>
              ))}
            </ul>
          </Section>
          <Card className="flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 size-5 text-success" aria-hidden />
              <div>
                <p className="text-[14px] font-semibold text-fg">Sign out</p>
                <p className="text-[12.5px] text-muted">End your session on this device.</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                signOut();
                router.replace("/");
                router.refresh();
              }}
            >
              <LogOut /> Sign out
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
