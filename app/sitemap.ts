
export const dynamic = 'force-static';

import { siteUrl } from "../lib/siteConfig";

export default function sitemap() {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
    },
  ];
}
