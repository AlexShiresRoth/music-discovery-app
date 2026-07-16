import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import SignInButton from "./auth-button";

export default async function SignInPage() {
  const user = await getSession();
  if (user) {
    return redirect("/");
  }
  return (
    <main className="flex flex-col items-center justify-center h-screen w-full">
      <div className="flex flex-col items-center">
        <h1>Welcome to the music discovery app (GREATE NAME RIGHT?)</h1>
        <p>
          This is a music discovery app that allows you to discover new music
          and artists.
        </p>
        <SignInButton provider="github">Sign In with Github</SignInButton>
      </div>
    </main>
  );
}
