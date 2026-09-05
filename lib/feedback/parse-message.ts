import { INPUT_MAX } from "@/lib/input-limits";
import "server-only";

export function parseFeedbackMessage(body: unknown): {
  message?: string;
  error?: string;
} {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const message = (body as { message?: unknown }).message;
  if (typeof message !== "string") {
    return { error: "Message is required" };
  }

  const trimmed = message.trim();
  if (!trimmed) {
    return { error: "Message is required" };
  }

  if (trimmed.length > INPUT_MAX.feedbackMessage) {
    return {
      error: `Message must be ${INPUT_MAX.feedbackMessage} characters or fewer`,
    };
  }

  return { message: trimmed };
}
