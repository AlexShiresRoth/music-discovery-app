import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { enforceRateLimit } from "@/lib/db/redis";
import { accountReportsSchema, profilesSchema } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

type RequestBody = {
  profileId: string;
  reportReason: string;
  description: string;
};

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const limited = await enforceRateLimit("report", ip);
    if (limited) return limited;

    const { profileId, reportReason, description } =
      (await request.json()) as RequestBody;

    if (!profileId || !reportReason || !description) {
      return NextResponse.json(
        { message: "All fields are required." },
        { status: 400 },
      );
    }

    const parsedProfileId = parseInt(profileId);

    const foundProfile = await db
      .select()
      .from(profilesSchema)
      .where(eq(profilesSchema.id, parsedProfileId));

    if (foundProfile.length === 0) {
      return NextResponse.json(
        { message: "Profile not found." },
        { status: 404 },
      );
    }

    const user = await getSession();

    await db.insert(accountReportsSchema).values({
      userRefId: user?.id,
      profileRefId: parsedProfileId,
      reportReason,
      description,
    });

    return NextResponse.json(
      {
        message:
          "Thank you for reporting this account. We will review it shortly.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
