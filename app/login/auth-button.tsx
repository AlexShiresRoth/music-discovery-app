"use client";

import { createClient } from "@/lib/supabase/client";
import { Provider } from "@supabase/supabase-js";
import { track } from "@vercel/analytics";
import { useSearchParams } from "next/navigation";

const supabase = createClient();

async function signInWithProvider(provider: Provider, next: string) {
  const redirectTo = `${window.location.origin}/auth/callback${next}`;
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
    },
  });
}

type SignInButtonProps = {
  provider: Provider;
  children: React.ReactNode;
};

export default function SignInButton({
  provider,
  children,
}: SignInButtonProps) {
  const searchParams = useSearchParams();
  const isRegister = searchParams.get("register") === "true";
  const next = isRegister ? "?next=/profile" : "";
  async function handleSignIn() {
    const { error } = await signInWithProvider(provider, next);
    if (error) {
      track("error_signing_in", { provider, error: JSON.stringify(error) });
      console.error(error);
    } else {
      track("signed_in", { provider });
    }
  }

  return (
    <button
      onClick={handleSignIn}
      className="w-full border rounded-md p-2 hover:cursor-pointer hover:bg-gray-100 transition-all"
    >
      {children}
    </button>
  );
}
