import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema, songClipsSchema } from "@/lib/db/schema";
import { SongClipWithSlot } from "@/lib/db/types";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { clips } = (await req.json()) as { clips: SongClipWithSlot[] };
    const session = await createServerClient();
    const {
      data: { user },
    } = await session.auth.getUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const reorderedClips = clips.map((clip, index) => ({
      id: clip.id,
      slot: index,
    }));

    await db
      .update(profilesSchema)
      .set({ songClips: reorderedClips })
      .where(eq(profilesSchema.userRefId, user.id));

    for await (const clip of reorderedClips) {
      await db
        .update(songClipsSchema)
        .set({
          slot: clip.slot,
        })
        .where(eq(songClipsSchema.id, Number(clip.id)));
    }

    return NextResponse.json(
      { message: "Clips reordered successfully" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: "Failed to reorder clips" },
      { status: 500 },
    );
  }
}
