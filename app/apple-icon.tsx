import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f59e0b",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 9999,
            background: "#1c1917",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
