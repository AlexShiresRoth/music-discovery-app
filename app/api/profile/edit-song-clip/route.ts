import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data: { title: string; full_song_url: string; id: string } =
    await request.json();

  const [profile] = await db
    .select()
    .from(profilesSchema)
    .where(eq(profilesSchema.userRefId, user.id))
    .limit(1);

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const foundClip = await db
    .select()
    .from(songClipsSchema)
    .where(eq(songClipsSchema.id, Number(data.id)));

  if (!foundClip) {
    return NextResponse.json({ error: "Song clip not found" }, { status: 404 });
  }

  await db
    .update(songClipsSchema)
    .set({
      title: data.title,
      full_song_url: data.full_song_url.trim(),
    })
    .where(eq(songClipsSchema.id, Number(data.id)));

  return NextResponse.json({ success: true });
}
