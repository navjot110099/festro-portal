import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const bars = [32, 44, 40, 58, 66, 61, 78, 92, 104, 118];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#F7F3ED",
          background: "radial-gradient(circle at 85% 10%, #6a1f33 0%, rgba(53,16,25,0) 45%), linear-gradient(135deg, #1b0b10 0%, #351019 55%, #120709 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="56" height="56" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="9" fill="#541827" />
            <path d="M11 23.5V10.4l9.6-2.6M11 16.6l6.4-1.7" fill="none" stroke="#F7F3ED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="23.4" cy="7.1" r="1.9" fill="#F7F3ED" />
          </svg>
          <div style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>FadHype</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
            <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -3, lineHeight: 1.02 }}>Digital Growth.</div>
            <div style={{ fontSize: 76, fontWeight: 600, letterSpacing: -3, lineHeight: 1.02, color: "#e7b8c2" }}>Built Smarter.</div>
            <div style={{ marginTop: 28, fontSize: 26, color: "rgba(247,243,237,0.72)", lineHeight: 1.4 }}>{site.shortDescription}</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160 }}>
            {bars.map((h, i) => (
              <div key={i} style={{ width: 18, height: h * 1.3, borderRadius: 5, background: i === bars.length - 1 ? "#e0697f" : "rgba(247,243,237,0.18)" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
