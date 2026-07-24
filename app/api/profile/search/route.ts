import { searchProfiles } from "@/lib/db/search";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    console.log(query);

    const searchResults = await searchProfiles(query, 5);

    return NextResponse.json(searchResults);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
