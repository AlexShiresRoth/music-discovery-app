import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();

    const existingProfile = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, user.id))
      .limit(1);

    if (existingProfile.length > 0) {
      return NextResponse.json(
        { error: "Profile already exists" },
        { status: 400 },
      );
    }

    await db
      .insert(profilesSchema)
      .values({
        joinedDate: new Date(),
        songClips: [],
        bio: data.bio,
        profileName: data.profileName,
        isVerified: false,
        location: data.location,
        website: data.website,
        facebook: data.facebook,
        instagram: data.instagram,
        tiktok: data.tiktok,
        spotify: data.spotify,
        appleMusic: data.appleMusic,
        soundcloud: data.soundcloud,
        genre: data.genre,
        fullName: data.fullName,
        contactEmail: data.contactEmail,
        userRefId: user.id,
      })
      .onConflictDoNothing();

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
