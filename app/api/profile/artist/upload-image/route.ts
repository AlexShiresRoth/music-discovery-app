import { createAdminClient, createServerClient } from "@/lib/auth";
import { NextResponse } from "next/server";
import { env } from "process";

export async function POST(request: Request) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  // Strip any path separators so a crafted filename can't escape the user's folder.
  const safeName = file.name.replace(/[/\\]/g, "_");

  // Use the admin client for storage so RLS doesn't block the upload.
  // Auth is already verified above via the user's session.
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from(env.ARTIST_IMAGES_BUCKET_NAME || "")
    .upload(`artist/${user.id}/${safeName}`, file, { upsert: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: urlData } = admin.storage
    .from(env.ARTIST_IMAGES_BUCKET_NAME || "")
    .getPublicUrl(`artist/${user.id}/${safeName}`);

  return NextResponse.json({ publicUrl: urlData.publicUrl });
}
