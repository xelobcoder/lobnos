import type { MetadataRoute } from "next";
import { absoluteUrl, siteUrl } from "../website/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/authentications/", "/authentication/", "/account/", "/crm/", "/billing/", "/operations/", "/inventory/", "/accounting/", "/pharmacy/", "/settings/", "/doctor/", "/patientportal/", "/patient-access/", "/human-resource/", "/analytics/", "/communications/", "/email-services/", "/organization/", "/clinicians/", "/appointments/", "/compliance/", "/commissions/", "/api/", "/facility-login", "/patient-portal", "/booking-status", "/facility-dashboard"] },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: new URL(siteUrl).host,
  };
}
