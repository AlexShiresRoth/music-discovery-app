import { enforceRateLimit } from "@/lib/db/redis";
import { searchCities, searchProfiles } from "@/lib/db/search";
import { NextResponse } from "next/server";

export async function GET(req: Request): Promise<Response> {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const limited = await enforceRateLimit("mutate", ip);
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const searchProfilesResults = await searchProfiles(query, 5);
    const searchCitiesResults = await searchCities(query, 5);

    return NextResponse.json({
      cities: searchCitiesResults,
      artists: searchProfilesResults,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
