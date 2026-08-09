import { ImageResponse } from "next/og";

export const alt = "Music Discovery App";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #fffbeb 0%, #f5f5f4 55%, #e7e5e4 100%)",
          color: "#1c1917",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 9999,
            border: "3px solid rgba(120,113,108,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 40,
            background: "rgba(245,158,11,0.12)",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 9999,
              background: "#f59e0b",
            }}
          />
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>
          Music Discovery App
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 28,
            color: "#57534e",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
          }}
        >
          Independent artists. Local scenes. No algorithms.
        </div>
      </div>
    ),
    { ...size },
  );
}
