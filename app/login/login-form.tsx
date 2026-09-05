"use client";

import TextInput from "@/components/text-input";
import { ToastContext } from "@/context/toast";
import { INPUT_MAX } from "@/lib/input-limits";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

type Props = {
  isSignUp?: boolean;
};

export default function LoginForm({ isSignUp = false }: Props) {
  const router = useRouter();
  const { setToast } = useContext(ToastContext);
  const [isPending, setIsPending] = useState(false);
  const [registerEmailSent, setRegisterEmailSent] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () =>
    setShowConfirmPassword(!showConfirmPassword);

  const isCoolingDown = resendCooldown > 0;

  useEffect(() => {
    if (!isCoolingDown) return;
    const id = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [isCoolingDown]);

  const handleResendConfirmation = async () => {
    if (!pendingEmail || isResending || resendCooldown > 0) return;
    setIsResending(true);
    try {
      const response = await fetch("/auth/resend-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const retryAfter = Number(response.headers.get("Retry-After") || 0);
        if (response.status === 429 && retryAfter > 0) {
          setResendCooldown(retryAfter);
        }
        setToast({
          message:
            data.error || data.message || "Could not resend confirmation email",
          type: "error",
        });
        return;
      }
      setResendCooldown(60);
      setToast({
        message: "Confirmation email sent",
        type: "success",
      });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "An error occurred",
        type: "error",
      });
    } finally {
      setIsResending(false);
    }
  };

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
        setPendingEmail(email.trim());
        setRegisterEmailSent(true);
        setResendCooldown(60);
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
      <div className="flex flex-col gap-4 w-full my-8">
        <p className="font-semibold text-gray-500">
          Please check your email for a verification link to complete your
          registration.
        </p>
        {pendingEmail ? (
          <p className="text-sm text-gray-500">
            Sent to <span className="text-gray-800">{pendingEmail}</span>
          </p>
        ) : null}
        <button
          type="button"
          disabled={isResending || resendCooldown > 0}
          onClick={handleResendConfirmation}
          className="border border-b-4 px-4 py-2 rounded hover:bg-gray-50 transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isResending ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </span>
          ) : resendCooldown > 0 ? (
            `Resend available in ${resendCooldown}s`
          ) : (
            "Resend confirmation email"
          )}
        </button>
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
        maxLength={INPUT_MAX.email}
        required
      />
      <TextInput
        type={showPassword ? "text" : "password"}
        placeholder="Password"
        name="password"
        isPending={isPending}
        togglePasswordVisibility={togglePasswordVisibility}
        maxLength={INPUT_MAX.password}
        required
      />
      {isSignUp && (
        <TextInput
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm Password"
          name="confirmPassword"
          isPending={isPending}
          togglePasswordVisibility={toggleConfirmPasswordVisibility}
          maxLength={INPUT_MAX.password}
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
