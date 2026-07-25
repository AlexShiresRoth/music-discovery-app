import { ProfileFormSchemaWithoutId } from "@/app/profile/schemas";
import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import type { SocialField } from "@/lib/db/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";

const SOCIAL_KEYS = [
  "website",
  "facebook",
  "instagram",
  "tiktok",
  "spotify",
  "appleMusic",
  "soundcloud",
  "bandcamp",
] as const;

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
    const data: Partial<ProfileFormSchemaWithoutId> = await request.json();

    const foundProfile = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, user.id))
      .limit(1);

    if (!foundProfile[0]) {
      throw new Error("Could not find profile");
    }

    const p = foundProfile[0];

    const urlsToValidate = SOCIAL_KEYS.map((name) => ({
      name,
      field: data[name] ?? { url: "", show: true },
    }));

    for (const { name, field } of urlsToValidate) {
      if (field.url && field.url !== "") {
        const isValid = URL.canParse(field.url);
        const containsName =
          name === "website" ? true : field.url.includes(name);
        if (!isValid || !containsName) {
          return NextResponse.json(
            { error: `${name}: "${field.url}" is not a valid ${name} URL` },
            { status: 400 },
          );
        }
      }
    }

    const socialUpdates = Object.fromEntries(
      SOCIAL_KEYS.filter((key) => data[key] !== undefined).map((key) => [
        key,
        data[key] as SocialField,
      ]),
    );

    const lat = Number(data.lat ?? p.lat) || 0;
    const lon = Number(data.lon ?? p.lon) || 0;

    await db
      .update(profilesSchema)
      .set({
        ...socialUpdates,
        bio: data.bio || p.bio,
        city: data.city || p.city,
        country: data.country || p.country,
        countryCode: data.countryCode || p.countryCode,
        state: data.state || p.state,
        stateCode: data.stateCode || p.stateCode,
        formattedLocation: data.formattedLocation || p.formattedLocation,
        lat,
        lon,
        profileName: data.profileName || p.profileName,
        location: `POINT(${lon} ${lat})`,
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
