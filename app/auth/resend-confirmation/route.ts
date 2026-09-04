import { createServerClient } from "@/lib/auth";
import { enforceRateLimit } from "@/lib/db/redis";
import { INPUT_MAX } from "@/lib/input-limits";
import { NextResponse } from "next/server";

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const trimmed = email.trim().toLowerCase();
  if (!trimmed || !trimmed.includes("@") || trimmed.length > INPUT_MAX.email) {
    return null;
  }
  return trimmed;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limitedIp = await enforceRateLimit("authEmail", `ip:${ip}`);
    if (limitedIp) return limitedIp;

    const body = await request.json().catch(() => null);
    const email = normalizeEmail(body?.email);
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const limitedEmail = await enforceRateLimit("authEmail", `email:${email}`);
    if (limitedEmail) return limitedEmail;

    const supabase = await createServerClient();
    const redirectTo =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || undefined;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: redirectTo
        ? {
            emailRedirectTo: redirectTo,
          }
        : undefined,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { message: "Confirmation email sent" },
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
