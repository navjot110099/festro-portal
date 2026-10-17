import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "linear-gradient(140deg, #9a2e45 0%, #541827 55%, #2a0c14 100%)" }}>
        <svg width="180" height="180" viewBox="0 0 32 32">
          <path d="M11 23.5V10.4l9.6-2.6M11 16.6l6.4-1.7" fill="none" stroke="#F7F3ED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="23.4" cy="7.1" r="1.9" fill="#F7F3ED" />
        </svg>
      </div>
    ),
    size,
  );
}
