import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      // Keep /profiles/ allowed — Disallow /profile would prefix-match it.
      allow: ["/", "/clips", "/profiles/"],
      disallow: [
        "/profile$",
        "/profile/",
        "/login",
        "/api/",
        "/auth/",
        "/logout",
        "/artist",
        "/location",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
