export const dynamic = 'force-static';

import { siteUrl } from "../../lib/siteConfig";

export async function GET() {
  const body = `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
