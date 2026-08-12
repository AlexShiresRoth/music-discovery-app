import { getSerifFontData } from "@/lib/serif-font-data";
import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default async function AppleIcon() {
  const fontData = await getSerifFontData();

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
            fontFamily: "Libre Baskerville",
            fontSize: 112,
            fontWeight: 700,
            lineHeight: 1,
            color: "#1c1917",
            marginTop: 8,
          }}
        >
          0
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Libre Baskerville",
          data: fontData,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
