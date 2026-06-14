import { createServerClient as createSupabaseServerClient } from "@supabase/ssr";
import { arrayContains, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import "server-only";
import { db } from "../db";
import { artistProfilesSchema, listenerProfilesSchema } from "../db/schema";

// TODO - to optimize wrap this req with cache
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSupabaseServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method can be ignored if
            // called from a Server Component
          }
        },
      },
    },
  );
}

export async function getSession() {
  try {
    const supabase = await createServerClient();
    const session = await supabase.auth.getUser();
    const { data, error } = session;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 *
 * @returns The artist profile for the current user
 * @description returns a singular profile for the current user
 */
// TODO - should this be api route? probably
export async function getArtistProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const profile = await db
    .select()
    .from(artistProfilesSchema)
    .where(
      arrayContains(artistProfilesSchema.membersWithAccess, [session.user.id]),
    )
    .limit(1);

  return profile?.[0];
}

/**
 *
 * @returns The listener profile for the current user
 * @description returns a singular profile for the current user
 */
export async function getListenerProfile() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const profile = await db
    .select()
    .from(listenerProfilesSchema)
    .where(eq(listenerProfilesSchema.userIdRef, session.user.id));

  return profile?.[0];
}
