import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ffmpeg-static"],
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "lebfkqasauzemindwngx.supabase.co",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
