import Footer from "@/components/footer";
import AppleIcon from "@/icons/apple";
import GithubIcon from "@/icons/github";
import GoogleIcon from "@/icons/google";
import { getSession } from "@/lib/auth";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { env } from "process";
import SignInButton from "./auth-button";
import LoginForm from "./login-form";

const NODE_ENV = env.NODE_ENV;

export const metadata: Metadata = {
  title: "Sign in",
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  searchParams: Promise<{
    register?: string;
  }>;
};
export default async function SignInPage({ searchParams }: Props) {
  const { register } = await searchParams;
  const isSignUp = register === "true";
  const user = await getSession();
  if (user) {
    return redirect("/");
  }
  return (
    <main className="flex flex-col items-center md:py-16 py-8 w-full">
      <div className="flex flex-col gap-4 md:w-1/2 max-w-sm w-full mx-auto">
        <h1 className="text-4xl font-bold">
          {isSignUp ? "Create an account" : "Welcome back"}
        </h1>
        <LoginForm isSignUp={isSignUp} />
        <div className="w-full flex items-center justify-center gap-2">
          <span className="w-full h-px bg-gray-400"></span>
          <span className="text-sm text-gray-500">or</span>
          <span className="w-full h-px bg-gray-400"></span>
        </div>
        <div className="flex flex-col gap-2 w-full">
          {NODE_ENV === "development" && (
            <SignInButton provider="github">
              <span className="inline-flex items-center justify-center gap-2">
                <GithubIcon size={18} />
                Continue with Github
              </span>
            </SignInButton>
          )}
          <SignInButton provider="google">
            <span className="inline-flex items-center justify-center gap-2">
              <GoogleIcon size={18} />
              Continue with Google
            </span>
          </SignInButton>
          {NODE_ENV === "development" && (
            <SignInButton provider="apple">
              <span className="inline-flex items-center justify-center gap-2">
                <AppleIcon size={18} />
                Continue with Apple
              </span>
            </SignInButton>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
