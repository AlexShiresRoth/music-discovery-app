"use client";
import { createClient } from "@/lib/supabase/client";
import { Provider } from "@supabase/supabase-js";

const supabase = createClient();

async function signInWithProvider(provider: Provider) {
  return await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: "/skibidi",
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
    const { data, error } = await signInWithProvider(provider);
    if (error) {
      console.error(error);
    }
    if (data) {
      console.log(data);
    }
  }

  return <button onClick={handleSignIn}>{children}</button>;
}
