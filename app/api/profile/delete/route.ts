import { createServerClient } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/db/redis";
import { deleteProfileForUser } from "@/lib/profile/delete-profile";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
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

    if (result.status === "not_found") {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (result.status === "error") {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Profile deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
