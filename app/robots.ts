import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: {
      userAgent: "*",
      // Keep /profiles/ allowed — Disallow /profile would prefix-match it.
      allow: [
        "/",
        "/clips",
        "/profiles/",
        "/about",
        "/community-guidelines",
        "/privacy",
        "/terms-and-conditions",
      ],
      disallow: [
        "/profile$",
        "/profile/",
        "/login",
        "/api/",
        "/auth/",
        "/logout",
        "/artist",
        "/location",
        "/account",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
