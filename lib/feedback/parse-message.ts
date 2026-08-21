import "server-only";

const MAX_MESSAGE_LENGTH = 5_000;

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

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return { error: `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer` };
  }

  return { message: trimmed };
}
