import type { CurrentUser, TeamMember } from "@/types";

/**
 * Sign-in account — documented in README.md.
 * Never ship real credentials in client code; this account only unlocks the seeded workspace.
 */
export const demoAccount = {
  email: "deep@festro.com",
  /** Earlier login email (pre-rebrand), still accepted. */
  aliases: ["deep@fadhype.com"],
  password: "growth2026",
} as const;

export const currentUser: CurrentUser = {
  id: "usr_deep",
  firstName: "Deep",
  name: "Deep",
  email: demoAccount.email,
  role: "Owner",
  initials: "D",
  workspace: "Meridian Studio",
  plan: "Growth Partner",
};

/** The Festro team assigned to this workspace. */
export const team: TeamMember[] = [
  { id: "tm_deep", name: "Deep", role: "Owner", initials: "D", hue: 348, email: "deep@festro.com" },
  { id: "tm_aanya", name: "Aanya Kapoor", role: "Growth Strategist", initials: "AK", hue: 18, email: "aanya@festro.com" },
  { id: "tm_marcus", name: "Marcus Bell", role: "Paid Media Lead", initials: "MB", hue: 214, email: "marcus@festro.com" },
  { id: "tm_sofia", name: "Sofia Marín", role: "SEO & Content Lead", initials: "SM", hue: 160, email: "sofia@festro.com" },
  { id: "tm_ethan", name: "Ethan Cole", role: "Web Engineer", initials: "EC", hue: 266, email: "ethan@festro.com" },
  { id: "tm_priya", name: "Priya Nair", role: "Account Manager", initials: "PN", hue: 38, email: "priya@festro.com" },
];

export const accountManager = team.find((m) => m.id === "tm_priya")!;

export function getMember(id: string) {
  return team.find((m) => m.id === id);
}
