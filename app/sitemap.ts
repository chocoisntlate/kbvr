import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublicDisplayNames } from "@/features/posts/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const displayNames = await getPublicDisplayNames();

  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/browse`, changeFrequency: "daily", priority: 0.8 },
    ...displayNames.map((name) => ({
      url: `${SITE_URL}/u/${encodeURIComponent(name)}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
