import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { profilesSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import "server-only";

// TODO - this is a placeholder for the actual verification process
export async function POST() {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.userRefId, user.id))
      .limit(1);
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await db
      .update(profilesSchema)
      .set({ isVerified: true })
      .where(eq(profilesSchema.userRefId, user.id));

    return NextResponse.json({ message: "Profile verified" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
