"use client";

import { LogoMark } from "@/components/brand/logo";
import { monthly } from "@/data/analytics";
import { campaignTotals, campaigns } from "@/data/campaigns";
import { primaryKpis, secondaryKpis } from "@/data/dashboard";
import { pipelineSummary } from "@/data/leads";
import { geoScore, keywords, seoKpis, seoScore } from "@/data/seo";
import { currentUser } from "@/data/user";
import { formatChange, formatCurrency, formatMetric, formatNumber, formatPercent } from "@/lib/format";
import type { ReportTemplate, ReportType } from "@/types";

/**
 * Print-ready report page. Always rendered on a light "paper" theme so the
 * on-screen preview matches the PDF. The report builder reads from the same
 * data layer as the dashboard.
 */

function MiniBars({ values, labels }: { values: number[]; labels: string[] }) {
  const max = Math.max(...values);
  const w = 520;
  const h = 130;
  const bw = 22;
  const gap = (w - bw * values.length) / (values.length - 1);
  return (
    <svg viewBox={`0 0 ${w} ${h + 18}`} className="h-auto w-full" role="img" aria-label="Monthly revenue, last 12 months">
      {[0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={0} x2={w} y1={h - h * t} y2={h - h * t} stroke="#efe8de" />
      ))}
      {values.map((v, i) => {
        const bh = (v / max) * (h - 8);
        const x = i * (bw + gap);
        return (
          <g key={i}>
            <path d={`M${x},${h} V${h - bh + 4} Q${x},${h - bh} ${x + 4},${h - bh} H${x + bw - 4} Q${x + bw},${h - bh} ${x + bw},${h - bh + 4} V${h} Z`} fill={i === values.length - 1 ? "#9b2c45" : "#d9b8bf"} />
            <text x={x + bw / 2} y={h + 14} textAnchor="middle" fontSize="10" fill="#8c8487">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Kpis({ items }: { items: { label: string; value: string; change: string; good: boolean }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((k) => (
        <div key={k.label} className="rounded-lg border border-[#e9e0d4] p-3">
          <p className="text-[10.5px] tracking-wide text-[#6e676b] uppercase">{k.label}</p>
          <p className="mt-1 text-[19px] font-semibold tracking-tight text-[#171416]">{k.value}</p>
          <p className={`text-[11px] font-medium ${k.good ? "text-[#22744f]" : "text-[#b0233a]"}`}>{k.change}</p>
        </div>
      ))}
    </div>
  );
}

const monthLabels = (() => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 11 + i, 1).toLocaleDateString("en-US", { month: "narrow" }));
})();

function sectionContent(type: ReportType) {
  const t = campaignTotals();
  const kpi = (id: string) => [...primaryKpis, ...secondaryKpis].find((k) => k.id === id)!;
  const fmt = (id: string) => {
    const k = kpi(id);
    return { label: k.id === "revenue-month" ? "Monthly revenue" : k.label, value: formatMetric(k.value, k.format), change: `${formatChange(k.change, k.changeKind)} ${k.comparison}`, good: (k.change >= 0) !== Boolean(k.inverse) };
  };

  switch (type) {
    case "seo":
      return {
        title: "SEO & GEO Report",
        summary: `Search visibility continued to compound. The SEO score rose ${seoScore.change} points to ${seoScore.score}/100 and AI visibility rose ${geoScore.change} points to ${geoScore.score}/100. Organic traffic reached ${formatNumber(seoKpis[0].value)} visits (${formatChange(seoKpis[0].change)}).`,
        kpis: seoKpis.slice(0, 4).map((k) => ({ label: k.label, value: formatMetric(k.value, k.format), change: formatChange(k.change, k.changeKind), good: true })),
        highlights: keywords.slice(0, 4).map((k) => `“${k.keyword}” ranks #${k.position}${k.change > 0 ? ` (+${k.change})` : ""}`),
        next: ["Publish the on-location vs studio comparison page", "Add internal links from 7 journal posts", "Fix mobile LCP on two service pages"],
      };
    case "campaign":
      return {
        title: "Campaign Report",
        summary: `Paid media returned ${t.roas.toFixed(1)}x blended ROAS on ${formatCurrency(t.spend)} of spend, generating ${formatNumber(t.leads)} leads and ${formatNumber(t.conversions)} conversions across ${t.active} active campaigns.`,
        kpis: [
          { label: "Spend", value: formatCurrency(t.spend), change: `${formatPercent(t.spend / t.budget, 0)} of budget`, good: true },
          { label: "Revenue", value: formatCurrency(t.revenue), change: "+18.4% vs last month", good: true },
          { label: "Leads", value: formatNumber(t.leads), change: "+14.2% vs last month", good: true },
          { label: "ROAS", value: `${t.roas.toFixed(1)}x`, change: "+0.6x vs last month", good: true },
        ],
        highlights: [...campaigns]
          .filter((c) => c.spend > 0)
          .sort((a, b) => b.revenue / b.spend - a.revenue / a.spend)
          .slice(0, 4)
          .map((c) => `${c.name}: ${(c.revenue / c.spend).toFixed(1)}x ROAS`),
        next: ["Shift $280/week from Reels into the consultation lead form", "Raise the corporate headshots search budget 20%", "Refresh Reels creative before relaunch"],
      };
    case "lead":
      return {
        title: "Lead Report",
        summary: `${formatNumber(pipelineSummary.total)} leads entered the pipeline over the last 90 days, ${formatNumber(pipelineSummary.byStatus.qualified)} of them qualified. ${pipelineSummary.byStatus.converted} became clients, up ${formatChange(pipelineSummary.change.converted)} on the previous period.`,
        kpis: [
          { label: "Total leads", value: formatNumber(pipelineSummary.total), change: formatChange(pipelineSummary.change.total), good: true },
          { label: "Qualified", value: formatNumber(pipelineSummary.byStatus.qualified), change: formatChange(pipelineSummary.change.qualified), good: true },
          { label: "Proposals", value: formatNumber(pipelineSummary.byStatus.proposal), change: formatChange(pipelineSummary.change.proposal), good: true },
          { label: "Converted", value: formatNumber(pipelineSummary.byStatus.converted), change: formatChange(pipelineSummary.change.converted), good: true },
        ],
        highlights: ["Referral and LinkedIn leads qualify at twice the rate of social", "Median first response fell 41% to 3h 12m", "12 proposals open for more than 7 days ($19.4K)"],
        next: ["Activate the AI qualification agent for instant first replies", "Assign the 38 waiting qualified leads", "Add a two-date-option proposal template"],
      };
    case "roi":
      return {
        title: "ROI Report",
        summary: `Across every FadHype service on the ${currentUser.plan} plan, attributed revenue over the last six months was ${formatCurrency(kpi("total-revenue").value)}, up ${formatChange(kpi("total-revenue").change)} on the prior six months. Paid media alone returned ${t.roas.toFixed(1)}x.`,
        kpis: [fmt("total-revenue"), fmt("roi"), fmt("cac"), fmt("conversion-rate")],
        highlights: ["Payback period on paid media: 19 days", "Organic channel now 22% of attributed revenue", "CAC down 9.3% month over month"],
        next: ["Reinvest efficiency gains into high-intent search", "Launch conversion optimisation (projected +14%)", "Review the Q1 forecast with your strategist"],
      };
    default:
      return {
        title: "Monthly Performance Report",
        summary: `${currentUser.workspace} had its strongest month on record: ${formatCurrency(kpi("revenue-month").value)} in revenue (${formatChange(kpi("revenue-month").change)}), driven by high-intent search and a compounding organic channel. Paid media returned ${t.roas.toFixed(1)}x and AI search visibility rose to ${geoScore.score}/100.`,
        kpis: [fmt("revenue-month"), fmt("qualified-leads"), fmt("conversion-rate"), fmt("roi")],
        highlights: ["“corporate headshots” now ranks #3 (+2)", "Client acquisition cost fell 9.3% to $46.20", "Website visitors up 22.1% to 48.2K"],
        next: ["Scale the consultation lead form", "Launch the on-location vs studio comparison page", "Start the AI qualification agent"],
      };
  }
}

export function ReportPreview({ template, period }: { template: ReportTemplate; period: string }) {
  const c = sectionContent(template.id);
  return (
    <article
      data-theme="light"
      aria-label={`${c.title} preview`}
      className="mx-auto w-full max-w-[760px] rounded-sm bg-white text-[#171416] shadow-[0_1px_2px_rgba(53,16,25,0.06),0_20px_50px_-20px_rgba(53,16,25,0.35)]"
    >
      <div className="h-1.5 rounded-t-sm bg-[linear-gradient(90deg,#351019,#8e263b,#541827)]" />
      <div className="p-7 sm:p-10">
        <header className="flex items-start justify-between gap-4 border-b border-[#efe8de] pb-6">
          <div className="flex items-center gap-2.5">
            <LogoMark className="size-7" />
            <div className="leading-tight">
              <p className="text-[14px] font-semibold tracking-[-0.02em]">FadHype</p>
              <p className="text-[10.5px] text-[#6e676b]">Digital Growth. Built Smarter.</p>
            </div>
          </div>
          <div className="text-right text-[11px] text-[#6e676b]">
            <p>Prepared for</p>
            <p className="text-[13px] font-semibold text-[#171416]">{currentUser.workspace}</p>
            <p>{period}</p>
          </div>
        </header>

        <h2 className="mt-7 text-[26px] leading-tight font-semibold tracking-[-0.03em]">{c.title}</h2>
        <p className="mt-1 font-display text-[16px] text-[#8e263b] italic">{period}</p>

        <section className="mt-6">
          <h3 className="text-[11px] font-semibold tracking-[0.12em] text-[#8e263b] uppercase">Executive summary</h3>
          <p className="mt-2 text-[13.5px] leading-relaxed text-[#463f42]">{c.summary}</p>
        </section>

        <section className="mt-6">
          <Kpis items={c.kpis} />
        </section>

        <section className="mt-7 grid gap-6 sm:grid-cols-5">
          <div className="sm:col-span-3">
            <h3 className="text-[11px] font-semibold tracking-[0.12em] text-[#8e263b] uppercase">Revenue trend · 12 months</h3>
            <div className="mt-3">
              <MiniBars values={monthly.revenue} labels={monthLabels} />
            </div>
          </div>
          <div className="sm:col-span-2">
            <h3 className="text-[11px] font-semibold tracking-[0.12em] text-[#8e263b] uppercase">Highlights</h3>
            <ul className="mt-3 space-y-2">
              {c.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-[12.5px] leading-snug text-[#463f42]">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-[#8e263b]" aria-hidden />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-7 rounded-lg bg-[#f8f3ec] p-4">
          <h3 className="text-[11px] font-semibold tracking-[0.12em] text-[#8e263b] uppercase">Next month’s plan</h3>
          <ol className="mt-2.5 grid gap-2 sm:grid-cols-3">
            {c.next.map((n, i) => (
              <li key={n} className="text-[12.5px] leading-snug text-[#463f42]">
                <span className="mb-1 block font-mono text-[10.5px] text-[#958d90]">0{i + 1}</span>
                {n}
              </li>
            ))}
          </ol>
        </section>

        <footer className="mt-8 flex items-center justify-between border-t border-[#efe8de] pt-4 text-[10.5px] text-[#958d90]">
          <span>Sections: {template.sections.join(" · ")}</span>
          <span>Page 1 of {template.pages}</span>
        </footer>
      </div>
    </article>
  );
}
