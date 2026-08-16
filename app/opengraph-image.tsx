import { getSerifFontData } from "@/lib/serif-font-data";
import { ImageResponse } from "next/og";

export const alt = "Side0";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
        }}
      >
        <div
          style={{
            fontFamily: "Libre Baskerville",
            fontSize: 420,
            fontWeight: 700,
            lineHeight: 1,
            color: "#1c1917",
            marginTop: 24,
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
