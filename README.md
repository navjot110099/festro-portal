# FadHype — Digital Growth Portal

**Digital Growth. Built Smarter.**

A premium client operating system for FadHype, a digital growth company: performance dashboards, analytics, lead management, an AI growth assistant, SEO & GEO visibility, campaigns, services, portfolio, delivery board, client reporting and support, in one product.

This is a portfolio build. All data is illustrative and comes from a central mock data layer that can be swapped for real APIs without touching components.

---

## Demo login

| Field    | Value              |
| -------- | ------------------ |
| Email    | `deep@fadhype.com` |
| Password | `growth2026`       |

The sign-in page has a **Use demo account** button that fills these in. Credentials live in `src/data/user.ts`. They only unlock mock data.

The demo workspace belongs to a fictional client, **Meridian Studio**, a B2B photo and video studio. The case studies under **Projects** (LumaFit, Northwind Dental and others) are fictional too, and the UI labels them as illustrative.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all routes prerender statically)
npm start          # serve the production build
npm run lint
npm run typecheck
```

Requires Node 20+.

---

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS 4** with a token-based design system (`src/styles/globals.css`)
- **Radix UI** primitives for dialogs, drawers, menus, popovers, tabs and tooltips (accessible focus management)
- **Framer Motion** for interaction animation; CSS for page and card entrances
- **Recharts** for charts, using a colour-blind-validated palette in both themes
- **dnd-kit** for the Kanban board (mouse, touch and keyboard)
- **Lucide** icons

---

## Structure

```
src/
  app/                 Routes (the App Router's "pages"), metadata, robots, sitemap, OG image, icons
    page.tsx           Public entry / sign-in (SEO, JSON-LD structured data)
    (portal)/          Authenticated portal: one folder per section, all noindex
  views/               Page-level compositions (one per route)
  layouts/             App shell: sidebar, top bar, mobile nav, command palette, menus
  components/
    ui/                Design-system primitives (button, card, badge, inputs, dialog, tabs…)
    charts/            Chart kit, trend, stacked, grouped and rate charts, bar lists, sparklines
    shared/            Page header, KPI card, async state wrapper, theme toggle, stagger
    <feature>/         Feature components (leads, ai, tasks, reports, login…)
    providers/         Theme, motion preference and toast providers
  data/                Central mock data (single source of truth for every number)
  lib/
    api/               Resource layer + demo transport (swap point for real backends)
    ai/                FadHype AI engine (swap point for a model API)
    auth.ts, nav.ts, format.ts, site.ts, utils.ts
  hooks/               useResource, useCountUp, useStoredState, useHotkey
  styles/              globals.css (tokens, themes, motion, print)
  types/               Domain model shared by UI and data layer
  proxy.ts             Route protection (Next 16 "proxy", formerly middleware)
```

> Next.js reserves a `pages/` directory for its legacy router, so routes live in `src/app` and page compositions in `src/views`.

---

## Connecting real data

Components never import mock data directly. They call `api.*` from `src/lib/api/index.ts` through the `useResource` hook, which handles loading, empty, error and success states.

To go live, replace a resolver body:

```ts
// src/lib/api/index.ts
leads: {
  list: () => request("/leads", () => buildLeads(), { empty: [] }),
}

// becomes, for example
leads: {
  list: async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`);
    if (!res.ok) throw new ApiError("Couldn't load leads", res.status);
    return (await res.json()) as Lead[];
  },
}
```

The same applies to Supabase/PostgreSQL queries, CRM (HubSpot), analytics (GA4, Search Console) and ad-platform APIs. The types in `src/types` are the contract.

- **Auth:** `src/lib/auth.ts` sets a demo cookie that `src/proxy.ts` checks. Swap `signIn` for your identity provider and set an httpOnly session cookie server-side. The proxy check stays the same.
- **AI:** `src/lib/ai/engine.ts` returns structured `AiBlock` responses (text, metrics, tables, bar charts, callouts, actions). Point it at a server route that calls your model with a matching JSON schema. The UI already renders progressively.

### Demo data modes

**Settings → Demo data** switches the whole portal between *Live demo data*, *Empty workspace* and *Simulate outages*, so you can review every section's empty and error states.

---

## Design system

- **Palette:** dark cherry `#541827`, deep burgundy `#351019`, warm off-white `#F7F3ED`, soft cream `#EFE8DE`, charcoal `#171416`, accent red `#8E263B`. Semantic tokens (`bg-surface`, `text-muted`, `border-line`, `text-accent-ink`…) are re-declared per theme, so components never hard-code colours.
- **Typography:** Geist (UI), Geist Mono (data and labels), Instrument Serif italic (sparing brand accent).
- **Charts:** a 5-slot categorical palette validated for colour-vision-deficiency separation and ≥3:1 contrast in light and dark; single-axis charts only; hairline grids; hover tooltips; screen-reader data tables.
- **Themes:** light, dark and system. The choice persists, an inline script prevents a flash on load, and switching animates as a circular reveal (View Transitions API, with a cross-fade fallback).

---

## Quality notes

- **Accessibility:** semantic landmarks, skip link, one `h1` per page, labelled form controls, visible focus rings, keyboard support throughout (⌘K command menu, `[` to toggle the sidebar, `G` then `D/L/A…` navigation, keyboard drag-and-drop between Kanban columns with screen-reader announcements). Text tokens meet WCAG AA (≥4.5:1). Reduced motion is honoured from the OS and from an in-app setting.
- **Responsive:** sidebar → icon rail → mobile drawer + bottom tab bar; tables become cards on small screens; checked for zero horizontal overflow at 375px and 768px on every route.
- **SEO:** the public entry page has title, description, canonical URL, Open Graph/Twitter metadata, a generated OG image, favicon/apple icon, manifest, `robots.txt`, `sitemap.xml`, and Organization + ProfessionalService + WebSite JSON-LD. Portal routes are `noindex` and disallowed in robots.
- **Performance:** every route prerenders statically; entrances use CSS so content is visible before hydration; charts and data load client-side behind skeletons; no images to download (project artwork is generated in CSS).
- **Reports:** “Download PDF” prints a dedicated light-theme copy of the report through the print stylesheet. Choose “Save as PDF” in the print dialog.

Set `NEXT_PUBLIC_SITE_URL` to your production domain so canonical URLs, the sitemap and structured data point to the right host.
