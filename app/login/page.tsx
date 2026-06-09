import SignInButton from "./auth-button";

export default function SignInPage() {
  return (
    <main>
      <div className="flex flex-col items-center justify-center h-screen">
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
