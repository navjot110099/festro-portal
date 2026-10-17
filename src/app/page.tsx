import type { Metadata } from "next";
import { site } from "@/lib/site";
import { LoginView } from "@/views/login-view";

export const metadata: Metadata = {
  title: { absolute: `${site.name} — ${site.tagline} | Digital Growth Portal` },
  description: site.description,
  alternates: { canonical: "/" },
};

/** Structured data for the public entry page (Organization + ProfessionalService + WebSite). */
function StructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${site.url}/#organization`,
        name: site.name,
        url: site.url,
        logo: `${site.url}/icon.svg`,
        slogan: site.tagline,
        description: site.description,
        email: site.email,
      },
      {
        "@type": "ProfessionalService",
        "@id": `${site.url}/#service`,
        name: `${site.name} Digital Growth`,
        provider: { "@id": `${site.url}/#organization` },
        url: site.url,
        description: site.shortDescription,
        areaServed: "Worldwide",
        knowsAbout: ["Digital marketing", "Web development", "Search engine optimization", "Generative engine optimization", "Lead generation", "AI automation", "E-commerce development"],
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Digital growth services",
          itemListElement: site.services.map((name) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name } })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: `${site.name} Digital Growth Portal`,
        publisher: { "@id": `${site.url}/#organization` },
        inLanguage: "en",
      },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export default function HomePage() {
  return (
    <>
      <StructuredData />
      <LoginView />
    </>
  );
}
