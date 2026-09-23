import { getBlogIndex } from "@/lib/data/problems";
import { siteConfig } from "@/lib/config";

export const dynamic = "force-static";

function xmlEscape(value: string): string {
  return value.replace(/[<>&'"]/g, (char) => {
    const map: Record<string, string> = {
      "<": "&lt;",
      ">": "&gt;",
      "&": "&amp;",
      "'": "&apos;",
      '"': "&quot;",
    };
    return map[char];
  });
}

function cdata(value: string): string {
  return "<![CDATA[" + value.replaceAll("]]>", "]]]]><![CDATA[>") + "]]>";
}

export function GET() {
  const posts = getBlogIndex();
  const base = siteConfig.url.replace(/\/$/, "");
  const items = posts.map((post) => {
    const url = base + "/blog/" + post.slug;
    return `
    <item>
      <title>${cdata(post.title)}</title>
      <link>${xmlEscape(url)}</link>
      <guid isPermaLink="true">${xmlEscape(url)}</guid>
      <description>${cdata(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>`;
  }).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${cdata(siteConfig.name + " Blog")}</title>
    <link>${xmlEscape(base + "/blog")}</link>
    <description>${cdata(siteConfig.description)}</description>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
