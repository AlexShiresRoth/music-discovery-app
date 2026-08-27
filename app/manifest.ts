import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sidezero",
    short_name: "Side0",
    description:
      "Discover independent artists and local scenes — no algorithms, just music nearby.",
    start_url: "/",
    display: "standalone",
    background_color: "#f59e0b",
    theme_color: "#000000",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
