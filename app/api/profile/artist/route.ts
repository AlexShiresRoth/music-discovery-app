import { createServerClient } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
  console.log("auth", await supabase.auth.getUser());

  try {
    const data = await request.json();
    console.log("data", data);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
