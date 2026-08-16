import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    const foundProfile = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, user.id));
    if (foundProfile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { public: isPublic } = foundProfile[0];

    await db
      .update(profilesSchema)
      .set({ public: !isPublic })
      .where(eq(profilesSchema.id, foundProfile[0].id));
    return NextResponse.json(
      {
        message: isPublic
          ? "Profile hidden successfully"
          : "Profile made public successfully",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
