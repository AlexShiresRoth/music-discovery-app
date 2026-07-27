import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { getSongClipsByIds } from "@/lib/db/song-clips";
import { and, asc, inArray, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

async function fetchProfilesByLocation(
  longitude: number,
  latitude: number,
  genres: string[],
  limit: number,
  startIndex: number,
) {
  const searchPoint = sql`
    ST_SetSRID(
      ST_MakePoint(${longitude}, ${latitude}),
      4326
    )::geography
  `;

  const distance = sql<number>`
    ST_Distance(${profilesSchema.location}, ${searchPoint})
  `;

  const RADIUS = 40_000;

  return await db
    .select()
    .from(profilesSchema)
    .where(
      genres.length > 0
        ? and(
            inArray(profilesSchema.genre, genres),
            sql`ST_DWithin(${profilesSchema.location}, ${searchPoint}, ${RADIUS})`,
          )
        : sql`ST_DWithin(${profilesSchema.location}, ${searchPoint}, ${RADIUS})`,
    )
    .orderBy(asc(distance))
    .offset(startIndex)
    .limit(limit);
}

async function fetchProfilesByGenres(
  genres: string[],
  limit: number,
  startIndex: number,
) {
  return await db
    .select()
    .from(profilesSchema)
    .where(
      genres.length > 0
        ? inArray(profilesSchema.genre, genres as string[])
        : undefined,
    )
    .offset(Number(startIndex))
    .limit(Number(limit));
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genres = searchParams.getAll("g") || [];
    const startIndex = searchParams.get("start") || "0";
    const limit = searchParams.get("limit") || "15";
    const longitude = searchParams.get("lon") || "";
    const latitude = searchParams.get("lat") || "";

    const profiles =
      longitude && latitude
        ? await fetchProfilesByLocation(
            parseFloat(longitude),
            parseFloat(latitude),
            genres,
            parseInt(limit),
            parseInt(startIndex),
          )
        : await fetchProfilesByGenres(
            genres,
            parseInt(limit),
            parseInt(startIndex),
          );

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
