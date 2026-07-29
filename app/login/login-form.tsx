"use client";

import TextInput from "@/components/text-input";
import { ToastContext } from "@/context/toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";

type Props = {
  isSignUp?: boolean;
};
export default function LoginForm({ isSignUp = false }: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isPending, setIsPending] = useState(false);
  const [registerEmailSent, setRegisterEmailSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    setIsPending(true);
    e.preventDefault();
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      const confirmPassword = formData.get("confirmPassword") as string;
      if (isSignUp && password !== confirmPassword) {
        setToast({
          message: "Passwords do not match",
          type: "error",
        });
        return;
      }
      const response = await fetch(
        `/auth/email?${isSignUp ? "register=true" : ""}`,
        {
          method: "POST",
          body: JSON.stringify({ email, password }),
        },
      );
      if (!response.ok) {
        const error = await response.json();
        setToast({
          message: error.error,
          type: "error",
        });
        return;
      }
      if (isSignUp) {
        setRegisterEmailSent(true);
        setToast({
          message: "Email sent",
          type: "success",
        });
        return;
      }
      router.refresh();
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "An error occurred",
        type: "error",
      });
    } finally {
      setIsPending(false);
    }
  };
  if (registerEmailSent) {
    return (
      <div className="flex flex-col gap-2 w-full my-8">
        <p className="font-semibold text-gray-500">
          Please check your email for a verification link to complete your
          registration.
        </p>
      </div>
    );
  }
  return (
    <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
      <TextInput
        type="email"
        placeholder="Email"
        name="email"
        isPending={isPending}
        required
      />
      <TextInput
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        name="password"
        isPending={isPending}
        togglePasswordVisibility={togglePasswordVisibility}
        required
      />
      {isSignUp && (
        <TextInput
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          name="confirmPassword"
          isPending={isPending}
          togglePasswordVisibility={toggleConfirmPasswordVisibility}
          required
        />
      )}
      <button
        disabled={isPending}
        type="submit"
        className="bg-amber-500 border border-b-4 px-4 py-2 rounded hover:bg-amber-400 transition-colors hover:cursor-pointer"
      >
        {isPending ? (
          <span className="inline-flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin disabled:opacity-50" />
            Authenticating...
          </span>
        ) : (
          "Continue with email"
        )}
      </button>
      <div className="text-center text-sm text-gray-500">
        {isSignUp ? (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Login
            </Link>
          </p>
        ) : (
          <p>
            Don{`'`}t have an account?{" "}
            <Link href="/login?register=true" className="underline">
              Sign up
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}
