import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkHtml from "remark-html";
import { siteConfig } from "@/lib/config";

function prefixInternalUrls(html: string): string {
  const basePath = siteConfig.basePath;
  if (!basePath) return html;

  return html.replace(
    /(href|src)=(["'])(\/((?!\/)[^"']*))\2/gi,
    (match, attribute, quote, url) => {
      if (url === basePath || url.startsWith(basePath + "/")) return match;
      return attribute + "=" + quote + basePath + url + quote;
    }
  );
}

/** Convert Markdown into static HTML while keeping code blocks plain. */
export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkHtml, { sanitize: false })
    .process(markdown);

  return prefixInternalUrls(String(result));
}
