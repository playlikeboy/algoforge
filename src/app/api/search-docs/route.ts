import { NextResponse } from "next/server";
import { getSearchDocuments } from "@/lib/data/problems";

export async function GET() {
  const docs = getSearchDocuments();
  return NextResponse.json(docs);
}
