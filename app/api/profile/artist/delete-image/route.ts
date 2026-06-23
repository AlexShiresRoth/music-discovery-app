import { createAdminClient, createServerClient } from "@/lib/auth";
import { NextResponse } from "next/server";
import { env } from "process";

export const DELETE = async (request: Request) => {
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
    .from(env.ARTIST_IMAGES_BUCKET_NAME || "")
    .remove([`artist/${user.id}/${safeName}`]);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Image deleted" }, { status: 200 });
};
