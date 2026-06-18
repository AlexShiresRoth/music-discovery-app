import "server-only";
import { createServerClient } from "./client";

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
