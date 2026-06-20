import "server-only";
import { createServerClient } from "./client";

export async function getSession() {
  try {
    const supabase = await createServerClient();

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error(error);
    return { session: null, error };
  }
}
