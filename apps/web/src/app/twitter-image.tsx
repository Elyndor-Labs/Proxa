import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = siteConfig.description;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Auto-generated Twitter card image. */
export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, color: "#CCFF00", marginBottom: 24 }}>PROXA</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
          Trustless parametric props on Solana
        </div>
        <div style={{ fontSize: 28, marginTop: 24, color: "#a1a1aa" }}>{siteConfig.description}</div>
      </div>
    ),
    { ...size },
  );
}
