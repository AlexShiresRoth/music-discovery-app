"use client";

import { createClient } from "@/lib/supabase/client";
import { Provider } from "@supabase/supabase-js";

const supabase = createClient();

async function signInWithProvider(provider: Provider) {
  const redirectTo = `${window.location.origin}/auth/callback`;
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
  async function handleSignIn() {
    const { error } = await signInWithProvider(provider);
    if (error) {
      console.error(error);
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
