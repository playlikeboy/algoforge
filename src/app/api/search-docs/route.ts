import { getSearchDocuments } from "@/lib/data/problems";

export const dynamic = "force-static";

export function GET() {
  return Response.json(getSearchDocuments(), {
    headers: {
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
