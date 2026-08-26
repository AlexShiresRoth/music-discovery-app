import { createAdminClient, createServerClient } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/db/redis";
import { NextResponse } from "next/server";
import { env } from "process";

export const DELETE = async (request: Request) => {
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

  const { safeName } = await request.json();

  if (!safeName) {
    return NextResponse.json(
      { error: "File name is required" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(env.IMAGES_BUCKET_NAME || "")
    .remove([`profile/${user.id}/${safeName}`]);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Image deleted" }, { status: 200 });
};
