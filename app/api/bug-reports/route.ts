import { createServerClient } from "@/lib/auth";
import { db } from "@/lib/db";
import { bugReportsSchema } from "@/lib/db/schema";
import { parseFeedbackMessage } from "@/lib/feedback/parse-message";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
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

    const body = await request.json();
    const { message, error: parseError } = parseFeedbackMessage(body);
    if (parseError || !message) {
      return NextResponse.json({ error: parseError }, { status: 400 });
    }

    await db.insert(bugReportsSchema).values({
      message,
      userRefId: user.id,
    });

    return NextResponse.json(
      { message: "Bug report submitted" },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
