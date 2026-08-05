import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { SongClipWithProfile } from "@/lib/db/types";
import { desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const genres = searchParams.getAll("g") || [];
    const startIndex = searchParams.get("start") || "0";
    const limit = searchParams.get("limit") || "15";
    const songClips = await db
      .select()
      .from(songClipsSchema)
      .where(
        genres.length > 0
          ? inArray(songClipsSchema.genre, genres as string[])
          : undefined,
      )
      .orderBy(desc(songClipsSchema.updatedAt))
      .offset(Number(startIndex))
      .limit(Number(limit));

    const songClipsWithProfiles = (await Promise.all(
      songClips.map(async (clip) => {
        const profile = await db
          .select()
          .from(profilesSchema)
          .where(eq(profilesSchema.id, clip.profileRefId));
        return {
          ...clip,
          profileId: profile[0].id,
          profileName: profile[0].profileName,
          profileImage: profile[0].imageUrl,
        };
      }),
    )) as SongClipWithProfile[];

    return NextResponse.json(songClipsWithProfiles);
  } catch (error) {
    console.error("Error fetching song clips:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
