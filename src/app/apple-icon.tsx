import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#541827" }}>
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M11 7.5h11v3.4h-7.2v3.6h6.3v3.3h-6.3v6.7H11z" fill="#F7F3ED" />
        </svg>
      </div>
    ),
    size,
  );
}
