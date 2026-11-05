import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Sayvoya: plan a trip in one sentence. AI finds real flights and hotels for you.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ink = "#2a1b3d";
const inkMuted = "#5e5470";
const lavender = "#a78bf3";
const lavenderSoft = "#ddd3fb";

const [interMedium, interBold, heroPhoto] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Inter-Medium.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Inter-Bold.ttf")),
  readFile(join(process.cwd(), "public/images/hero-city.jpg"), "base64"),
]);

export default function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", position: "relative", fontFamily: "Inter" }}>
        <img
          src={`data:image/jpeg;base64,${heroPhoto}`}
          alt=""
          width={size.width}
          height={size.height}
          style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(to bottom, rgba(246,241,255,0.82), rgba(239,232,251,0.9) 55%, rgba(243,237,253,0.97))",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "56px 72px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 44, fontWeight: 700, color: ink }}>
              Sayvoya
              <Sparkle />
            </div>
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.75)",
                border: `2px solid ${lavenderSoft}`,
                fontSize: 24,
                fontWeight: 500,
                color: inkMuted,
              }}
            >
              AI travel planner
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div style={{ display: "flex", fontSize: 76, fontWeight: 700, color: ink, letterSpacing: -2, lineHeight: 1.05 }}>
              Plan a trip in one sentence.
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 32,
                padding: "28px 28px 28px 40px",
                borderRadius: 36,
                background: "white",
                border: `2px solid ${lavenderSoft}`,
                boxShadow: "0 20px 50px -12px rgba(167,139,243,0.45)",
              }}
            >
              <div style={{ display: "flex", flex: 1, fontSize: 30, fontWeight: 500, color: inkMuted, lineHeight: 1.35 }}>
                “Direct flights from Copenhagen to London next Friday, under 1500 kr.”
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "18px 32px",
                  borderRadius: 999,
                  background: lavender,
                  fontSize: 26,
                  fontWeight: 700,
                  color: ink,
                  whiteSpace: "nowrap",
                }}
              >
                Start planning
                <Arrow />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 500, color: inkMuted }}>
            <div style={{ display: "flex" }}>Real flights · Hotels · Your trip on one page</div>
            <div style={{ display: "flex", color: ink }}>sayvoya.onrender.com</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: interMedium, weight: 500, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
      ],
    },
  );
}

function Sparkle() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={ink} />
    </svg>
  );
}

function Arrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <path d="M3 3 L22 12 L3 21 L7 12 Z" fill={ink} />
    </svg>
  );
}
