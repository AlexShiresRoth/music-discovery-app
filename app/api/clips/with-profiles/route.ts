import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/db/redis";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { SongClipWithProfile } from "@/lib/db/types";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limited = await enforceRateLimit("upload", ip);
    if (limited) return limited;

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

    const songClipsWithProfiles = (
      await Promise.all(
        songClips.map(async (clip) => {
          const [profile] = await db
            .select()
            .from(profilesSchema)
            .where(
              and(
                eq(profilesSchema.id, clip.profileRefId),
                eq(profilesSchema.public, true),
              ),
            );
          if (!profile) {
            return null;
          }
          return {
            ...clip,
            profileId: profile.id,
            profileName: profile.profileName,
            profileImage: profile.imageUrl,
          };
        }),
      )
    ).filter((clip) => clip !== null) as SongClipWithProfile[];

    return NextResponse.json(songClipsWithProfiles);
  } catch (error) {
    console.error("Error fetching song clips:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
