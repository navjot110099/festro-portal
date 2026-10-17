import { createRandom } from "@/lib/random";
import type { Lead, LeadActivity, LeadSource, LeadStatus } from "@/types";

export const leadStatuses: { id: LeadStatus; label: string; description: string }[] = [
  { id: "new", label: "New", description: "Captured, not yet reviewed" },
  { id: "qualified", label: "Qualified", description: "Fits budget, timing and need" },
  { id: "contacted", label: "Contacted", description: "Conversation in progress" },
  { id: "proposal", label: "Proposal sent", description: "Quote or proposal delivered" },
  { id: "converted", label: "Converted", description: "Booked and paid" },
  { id: "lost", label: "Lost", description: "Closed without a booking" },
];

export const leadSourcesList: LeadSource[] = ["Google", "Instagram", "Meta Ads", "Organic SEO", "Referral", "LinkedIn"];

/** Pipeline counts for the last 90 days (all leads, by current stage). */
export const pipelineSummary = {
  period: "Last 90 days",
  total: 3412,
  byStatus: {
    new: 418,
    qualified: 1284,
    contacted: 742,
    proposal: 236,
    converted: 112,
    lost: 196,
  } satisfies Record<LeadStatus, number>,
  change: {
    total: 0.142,
    new: 0.086,
    qualified: 0.126,
    contacted: 0.071,
    proposal: 0.193,
    converted: 0.214,
    lost: -0.062,
  } satisfies Record<LeadStatus | "total", number>,
};

const people = [
  ["Harper Lyons", "Head of People", "Lumen Dental Group"],
  ["Mateo Alvarez", "Marketing Director", "Northfield Realty"],
  ["Imani Brooks", "Founder", "Copperline Coffee Roasters"],
  ["Noah Fischer", "Operations Manager", "Kestrel Logistics"],
  ["Leila Haddad", "Brand Manager", "Solace Skin Clinic"],
  ["Kenji Watanabe", "COO", "Quartz Analytics"],
  ["Olivia Grant", "Managing Partner", "Grant & Hale Law"],
  ["Rohan Mehta", "Head of Growth", "Orbit Software"],
  ["Chloe Dubois", "Events Lead", "Crescent Hotels"],
  ["Samuel Okafor", "CEO", "Nova Solar Systems"],
  ["Ava Thornton", "People & Culture Lead", "Summit Wealth Advisors"],
  ["Lucas Moreau", "Creative Director", "Juniper Apparel"],
  ["Zara Ahmed", "Practice Manager", "Pulse Health Partners"],
  ["Daniel Kim", "VP Marketing", "Ironclad Security"],
  ["Elena Petrova", "Communications Manager", "Riverbend University"],
  ["Arjun Rao", "Founder", "Fable Books & Co."],
  ["Grace Whitfield", "Office Manager", "Keystone Accounting"],
  ["Omar Siddiqui", "Director", "Atlas Engineering"],
  ["Freya Lindqvist", "Marketing Lead", "Bloom Botanicals"],
  ["Julian Price", "Partner", "Cedar & Stone Architects"],
  ["Maya Castillo", "HR Business Partner", "Elevate Chiropractic"],
  ["Theo Hartmann", "Head of Brand", "Aero Drone Works"],
  ["Nina Kovač", "Owner", "Silverleaf Spa"],
  ["Isaac Bennett", "Sales Director", "Harbor & Pine Interiors"],
  ["Sana Qureshi", "Marketing Manager", "Halo Med Spa"],
  ["Felix Wagner", "CEO", "Kinetic Fitness Lab"],
  ["Amara Nwosu", "Talent Lead", "Brightpath Learning"],
  ["Ryan Gallagher", "Founder", "Ridgeway Builders"],
  ["Inês Ferreira", "Events Manager", "Meadow Conference Centre"],
  ["Caleb Turner", "Director of Ops", "Wildflower Events"],
  ["Hana Suzuki", "Brand Lead", "Ember Kitchen Group"],
  ["Victor Laurent", "Managing Director", "Laurent Capital"],
  ["Priyanka Desai", "Head of Comms", "Vantage Physio"],
  ["Owen Fitzgerald", "Marketing Director", "Fitzgerald Motors"],
  ["Lucia Romano", "Founder", "Romano Bridal Atelier"],
  ["Ethan Park", "People Ops", "Parkside Clinics"],
  ["Yasmin Farouk", "Brand Manager", "Oasis Living"],
  ["Benjamin Hale", "COO", "Hale Freight"],
  ["Clara Jensen", "Head of Marketing", "Nordlys Furniture"],
  ["Marco Bellini", "Owner", "Bellini Trattoria"],
  ["Aisha Rahman", "Talent Acquisition", "Crescent Health"],
  ["Jonah Weiss", "CMO", "Weiss Dental Studio"],
  ["Sienna Clarke", "Marketing Lead", "Clarke & Co. Realty"],
  ["Dev Malhotra", "Founder", "Malhotra Ventures"],
  ["Rosa Jiménez", "Events Director", "Sol Events"],
  ["Tobias Berg", "Head of People", "Bergen Software"],
] as const;

const interests = [
  { label: "Team headshots", min: 380, max: 1800 },
  { label: "Brand photography day", min: 1400, max: 3600 },
  { label: "Conference coverage", min: 1800, max: 4800 },
  { label: "Executive portraits", min: 450, max: 1200 },
  { label: "Product & studio shoot", min: 900, max: 2600 },
  { label: "LinkedIn content package", min: 520, max: 1500 },
  { label: "Office culture shoot", min: 1100, max: 2900 },
  { label: "Short-form brand video", min: 1600, max: 4200 },
];

const campaigns: Record<LeadSource, string[]> = {
  Google: ["Search · Corporate headshots", "Search · Brand photography", "Performance Max · Retargeting"],
  Instagram: ["Reels · Behind the lens", "Stories · Studio tour"],
  "Meta Ads": ["Lead form · Free consultation", "Lookalike · Past clients"],
  "Organic SEO": ["Team headshot guide", "Corporate headshots page", "Event coverage page"],
  Referral: ["Client referral program", "Partner: coworking spaces"],
  LinkedIn: ["Decision makers · Case study", "HR leaders · Headshot day"],
};

const locations = ["Austin, TX", "Denver, CO", "Chicago, IL", "Seattle, WA", "Boston, MA", "Toronto, ON", "San Diego, CA", "Nashville, TN", "Portland, OR", "New York, NY"];

const statusPlan: LeadStatus[] = [
  "qualified", "new", "proposal", "contacted", "qualified", "converted", "new", "qualified", "contacted", "proposal",
  "qualified", "lost", "new", "converted", "contacted", "qualified", "proposal", "new", "qualified", "contacted",
  "converted", "qualified", "lost", "new", "proposal", "qualified", "contacted", "converted", "new", "qualified",
  "contacted", "proposal", "qualified", "lost", "new", "converted", "qualified", "contacted", "new", "proposal",
  "qualified", "converted", "contacted", "new", "qualified", "lost",
];

const assignees = ["tm_priya", "tm_aanya", "tm_deep", "tm_marcus", "tm_priya", "tm_aanya"];

const insights: Record<LeadStatus, string[]> = {
  new: [
    "Arrived from a high-intent search and viewed pricing within 2 minutes.",
    "Company is hiring — 6 open roles posted this month. Strong headshot-day fit.",
  ],
  qualified: [
    "Visited the pricing page 4 times this week. Recommend a same-day call.",
    "Team size (40+) matches your most profitable package. Offer an on-site day.",
  ],
  contacted: [
    "Opened your follow-up 3 times. A short case study usually moves this stage.",
    "Asked about turnaround time — mention the 72-hour delivery guarantee.",
  ],
  proposal: [
    "Proposal viewed twice, 9 minutes total. Follow up before Friday for best close rate.",
    "Similar proposals close 31% faster with a limited-availability date.",
  ],
  converted: [
    "Booked and paid. Ideal candidate for a referral ask after delivery.",
    "Repeat-purchase likelihood is high — schedule a quarterly refresh reminder.",
  ],
  lost: [
    "Lost on timing, not price. Re-engage in 60 days with seasonal availability.",
    "Chose a cheaper competitor. Nurture with portfolio content, not discounts.",
  ],
};

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function buildActivity(lead: { name: string; source: LeadSource; status: LeadStatus; createdAt: number }, rand: ReturnType<typeof createRandom>, now: number): LeadActivity[] {
  const items: LeadActivity[] = [];
  const hour = 3_600_000;
  const created = lead.createdAt;
  items.push({ id: "a1", type: "form", title: `Submitted enquiry via ${lead.source}`, detail: "Requested availability and package pricing.", at: new Date(created).toISOString() });
  items.push({ id: "a2", type: "visit", title: "Viewed pricing and 3 portfolio pages", at: new Date(created + rand.int(2, 20) * hour).toISOString() });
  const order: LeadStatus[] = ["qualified", "contacted", "proposal", "converted"];
  const reached = lead.status === "lost" ? 2 : Math.max(0, order.indexOf(lead.status) + 1);
  const span = Math.max(now - created, hour * 6);
  const step = span / (reached + 2);
  if (reached >= 1) items.push({ id: "a3", type: "status", title: "Qualified by lead scoring", detail: "Budget, timing and team size match.", at: new Date(created + step).toISOString(), by: "Festro AI" });
  if (reached >= 2) items.push({ id: "a4", type: "call", title: "Discovery call — 18 min", detail: "Discussed goals, dates and deliverables.", at: new Date(created + step * 1.6).toISOString(), by: "Priya Nair" });
  if (reached >= 3) items.push({ id: "a5", type: "email", title: "Proposal sent", detail: "Package proposal with two date options.", at: new Date(created + step * 2.2).toISOString(), by: "Aanya Kapoor" });
  if (lead.status === "converted") items.push({ id: "a6", type: "status", title: "Booking confirmed — deposit paid", at: new Date(now - rand.int(2, 30) * hour).toISOString() });
  if (lead.status === "lost") items.push({ id: "a6", type: "status", title: "Marked as lost", detail: "Timing — revisit next quarter.", at: new Date(now - rand.int(4, 60) * hour).toISOString() });
  return items.reverse();
}

/** Builds the lead list relative to "now" so the demo always feels current. */
export function buildLeads(now = Date.now()): Lead[] {
  const rand = createRandom(4821);
  const leads = people.map(([name, title, company], i) => {
    const source = leadSourcesList[(i * 7 + 3) % leadSourcesList.length];
    const status = statusPlan[i % statusPlan.length];
    const interest = interests[(i * 5 + 1) % interests.length];
    const createdAt = now - rand.int(1, 40) * 86_400_000 - rand.int(0, 23) * 3_600_000;
    const lastActivity = Math.max(createdAt + 3_600_000, now - (i < 6 ? rand.int(4, 90) * 60_000 : rand.int(2, 160) * 3_600_000));
    const baseScore = { new: 54, qualified: 78, contacted: 72, proposal: 84, converted: 92, lost: 31 }[status];
    const email = `${name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}@${company
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 18)}.com`;
    return {
      id: `lead_${(1040 + i).toString()}`,
      name,
      initials: initialsOf(name),
      title,
      company,
      email,
      phone: `+1 (555) ${String(200 + ((i * 37) % 700)).padStart(3, "0")}-${String(1000 + ((i * 431) % 9000)).slice(0, 4)}`,
      location: locations[i % locations.length],
      source,
      campaign: rand.pick(campaigns[source]),
      status,
      score: Math.min(99, Math.max(12, baseScore + rand.int(-9, 9))),
      value: Math.round(rand.range(interest.min, interest.max) / 10) * 10,
      assignedTo: assignees[i % assignees.length],
      lastActivity: new Date(lastActivity).toISOString(),
      createdAt: new Date(createdAt).toISOString(),
      interest: interest.label,
      insight: insights[status][i % 2],
      activity: buildActivity({ name, source, status, createdAt }, rand, now),
    };
  });

  // The headline lead referenced by notifications, the activity feed and Festro AI.
  leads[0] = {
    ...leads[0],
    status: "qualified",
    score: 86,
    value: 1890,
    interest: "Team headshots (42 staff)",
    lastActivity: new Date(now - 4 * 60_000).toISOString(),
    insight: "Visited the pricing page 4 times this week. Recommend a same-day call.",
  };
  return leads;
}
