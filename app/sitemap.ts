import { getPublicProfilesForSitemap } from "@/lib/auth";
import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const profiles = await getPublicProfilesForSitemap();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/clips`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const profileRoutes: MetadataRoute.Sitemap = profiles.map((profile) => ({
    url: `${siteUrl}/profiles/${profile.id}`,
    lastModified: profile.updatedAt ?? new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
    ...(profile.imageUrl ? { images: [profile.imageUrl] } : {}),
  }));

  return [...staticRoutes, ...profileRoutes];
}
