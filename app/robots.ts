import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.marktattoo.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/", "/my-bookings"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
