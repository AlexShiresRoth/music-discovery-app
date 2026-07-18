import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ffmpeg-static"],
  experimental: {
    // Song-clip uploads send the full source file through FormData before
    // server-side trimming. The proxy defaults to 10mb and returns 413 above that.
    proxyClientMaxBodySize: "20mb",
  },
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
