import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import { inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genres = searchParams.get("g") || [];
    const startIndex = searchParams.get("start") || "0";
    const limit = searchParams.get("limit") || "15";

    const profiles = await db
      .select()
      .from(profilesSchema)
      .where(
        genres.length > 0
          ? inArray(profilesSchema.genre, genres as string[])
          : undefined,
      )
      .offset(Number(startIndex))
      .limit(Number(limit));

    if (profiles.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(
      await Promise.all(
        profiles.map(async (profile) => {
          const songClips = await getSongClipsByIds(
            profile.songClips.map((clip) => clip.id),
          );
          return { ...profile, songClips };
        }),
      ),
    );
  } catch (error) {
    console.error("Error fetching profiles:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
