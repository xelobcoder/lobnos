import type { MetadataRoute } from "next";
import { industries, resources, solutions } from "../website/data/content";
import { getMarketplaceFacilities } from "../website/lib/marketplace";
import { absoluteUrl } from "../website/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", "/about", "/solutions", "/features", "/website/analytics", "/product-tour", "/pricing", "/industries", "/marketplace", "/join-facility", "/facilities", "/resources", "/contact", "/request-demo"];
  const facilityResult = await getMarketplaceFacilities();
  return [
    ...staticRoutes.map((route) => ({ url: absoluteUrl(route), changeFrequency: "monthly" as const, priority: route === "/" ? 1 : 0.7 })),
    ...solutions.map(({ slug }) => ({ url: absoluteUrl(`/solutions/${slug}`), changeFrequency: "monthly" as const, priority: 0.65 })),
    ...industries.map(({ slug }) => ({ url: absoluteUrl(`/industries/${slug}`), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...resources.map(({ slug }) => ({ url: absoluteUrl(`/resources/${slug}`), changeFrequency: "yearly" as const, priority: 0.45 })),
    ...(facilityResult.status === "ok" ? facilityResult.data.map(({ slug }) => ({ url: absoluteUrl(`/facilities/${slug}`), changeFrequency: "monthly" as const, priority: 0.5 })) : []),
  ];
}
