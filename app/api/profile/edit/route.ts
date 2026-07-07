import { ProfileFormSchemaWithoutId } from "@/app/profile/schemas";
import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";
export const POST = async (request: Request) => {
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
    const data: ProfileFormSchemaWithoutId = await request.json();

    const foundProfile = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, user.id))
      .limit(1);

    if (!foundProfile) {
      throw new Error("Could not find profile");
    }

    const p = foundProfile[0];

    await db
      .update(profilesSchema)
      .set({
        songClips: p.songClips,
        bio: data.bio || p.bio,
        profileName: data.profileName || p.profileName,
        country: data.country || p.country,
        state: data.state || p.state,
        city: data.city || p.city,
        website: data.website || p.website,
        facebook: data.facebook || p.facebook,
        instagram: data.instagram || p.instagram,
        tiktok: data.tiktok || p.tiktok,
        spotify: data.spotify || p.spotify,
        appleMusic: data.appleMusic || p.appleMusic,
        soundcloud: data.soundcloud || p.soundcloud,
        genre: data.genre || p.genre,
        fullName: data.fullName || p.fullName,
        contactEmail: data.contactEmail || p.contactEmail,
        imageUrl: data.imageUrl === "" ? null : data.imageUrl || p.imageUrl, // if this is specifically an empty string, set it to null to remove image
      })
      .where(eq(profilesSchema.userRefId, user.id));

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
};
