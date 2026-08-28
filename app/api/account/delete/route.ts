import { createAdminClient, createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/db/redis";
import { verificationRequestsSchema } from "@/lib/db/schema";
import { deleteProfileForUser } from "@/lib/profile/delete-profile";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";

    const limited = await enforceRateLimit("mutate", ip);
    if (limited) return limited;

    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await deleteProfileForUser(user.id);

    if (result.status === "error") {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // No profile is fine — still delete the auth account.
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.deleteUser(user.id);
    await db
      .delete(verificationRequestsSchema)
      .where(eq(verificationRequestsSchema.userRefId, user.id));
    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to delete account" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Account deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
