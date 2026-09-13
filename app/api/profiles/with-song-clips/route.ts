import { getProfilesWithSongClips, getProfilesWithSongClipsByLocation } from "@/lib/auth/profile";
import { enforceRateLimit } from "@/lib/db/redis";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limited = await enforceRateLimit("mutate", ip);
    if (limited) return limited;

    const { searchParams } = new URL(request.url);
    const status = searchParams.getAll("status");
    const startIndex = Number(searchParams.get("start") || "0");
    const limit = Number(searchParams.get("limit") || "15");
    const longitude = searchParams.get("lon");
    const latitude = searchParams.get("lat");

    const profiles =
      longitude && latitude
        ? await getProfilesWithSongClipsByLocation(
            parseFloat(longitude),
            parseFloat(latitude),
            status,
            startIndex,
            limit,
          )
        : await getProfilesWithSongClips(startIndex, limit, status);

    return NextResponse.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
