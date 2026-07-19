import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // ffmpeg-static is externalized but still associates next.config with the
    // upload route NFT graph; safe to ignore that false-positive.
    ignoreIssue: [
      {
        path: "next.config.ts",
        title: "Encountered unexpected file in NFT list",
      },
    ],
  },
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
