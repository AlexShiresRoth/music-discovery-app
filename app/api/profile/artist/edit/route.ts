import { ArtistProfileFormSchemaWithoutId } from "@/app/profile/schemas";
import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { artistProfilesSchema } from "@/lib/db/schema";
import { arrayContains } from "drizzle-orm";
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
    const data: ArtistProfileFormSchemaWithoutId = await request.json();

    const foundArtistProfile = await db
      .select()
      .from(artistProfilesSchema)
      .where(arrayContains(artistProfilesSchema.membersWithAccess, [user.id]))
      .limit(1);

    if (!foundArtistProfile) {
      throw new Error("Could not find artist profile");
    }

    const p = foundArtistProfile[0];

    await db
      .update(artistProfilesSchema)
      .set({
        songClips: p.songClips,
        members: data.members || p.members,
        artistDescription: data.artistDescription || p.artistDescription,
        artistLogo: data.artistLogo || p.artistLogo,
        artistName: data.artistName || p.artistName,
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
      })
      .where(arrayContains(artistProfilesSchema.membersWithAccess, [user.id]));

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
