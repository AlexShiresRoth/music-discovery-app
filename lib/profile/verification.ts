import { eq } from "drizzle-orm";
import { getSession } from "../auth";
import { db } from "../db";
import { verificationRequestsSchema } from "../db/schema";

export async function getProfileVerificationStatus() {
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }
    const [request] = await db
      .select()
      .from(verificationRequestsSchema)
      .where(eq(verificationRequestsSchema.userRefId, session.id))
      .limit(1);

    return request?.status;
  } catch (error) {
    console.error(error);
    return null;
  }
}
