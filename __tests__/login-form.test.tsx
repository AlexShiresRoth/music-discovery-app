import LoginForm from "@/app/login/login-form";
import { ToastContext } from "@/context/toast";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
}));

function renderForm(props: { isSignUp?: boolean } = {}, setToast = vi.fn()) {
  const { container } = render(
    <ToastContext.Provider value={{ toast: null, setToast }}>
      <LoginForm {...props} />
    </ToastContext.Provider>,
  );
  return { container, setToast };
}

function fillLoginFields(email = "user@example.com", password = "secret123") {
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: password },
  });
}

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe("login mode", () => {
    it("renders email and password fields without confirm password", () => {
      renderForm();
      expect(screen.getByPlaceholderText("Email")).toBeDefined();
      expect(screen.getByPlaceholderText("Password")).toBeDefined();
      expect(screen.queryByPlaceholderText("Confirm Password")).toBeNull();
      expect(
        screen.getByRole("button", { name: "Continue with email" }),
      ).toBeDefined();
    });

    it("links to the register page", () => {
      const { container } = renderForm();
      expect(
        container.querySelector('a[href="/login?register=true"]'),
      ).not.toBeNull();
    });

    it("posts credentials to /auth/email and refreshes on success", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: "user-1" } }),
      });
      const { container } = renderForm();

      fillLoginFields();
      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/auth/email?",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              email: "user@example.com",
              password: "secret123",
            }),
          }),
        );
        expect(mockRefresh).toHaveBeenCalled();
      });
    });

    it("shows an error toast when login fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Invalid login credentials" }),
      });
      const setToast = vi.fn();
      const { container } = renderForm({}, setToast);

      fillLoginFields();
      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Invalid login credentials",
          type: "error",
        });
        expect(mockRefresh).not.toHaveBeenCalled();
      });
    });

    it("shows Authenticating while the request is in flight", async () => {
      global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
      const { container } = renderForm();

      fillLoginFields();
      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(screen.getByText("Authenticating...")).toBeDefined();
        expect(
          screen.getByRole("button", { name: /Authenticating/i }),
        ).toHaveProperty("disabled", true);
      });
    });
  });

  describe("register mode", () => {
    it("renders confirm password and a login link", () => {
      const { container } = renderForm({ isSignUp: true });
      expect(screen.getByPlaceholderText("Confirm Password")).toBeDefined();
      expect(container.querySelector('a[href="/login"]')).not.toBeNull();
    });

    it("shows an error toast when passwords do not match", async () => {
      const setToast = vi.fn();
      const { container } = renderForm({ isSignUp: true }, setToast);

      fillLoginFields("user@example.com", "secret123");
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
        target: { value: "different" },
      });
      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "Passwords do not match",
          type: "error",
        });
      });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("posts to /auth/email?register=true and shows verification message", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ user: { id: "user-1" } }),
      });
      const setToast = vi.fn();
      const { container } = renderForm({ isSignUp: true }, setToast);

      fillLoginFields("user@example.com", "secret123");
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
        target: { value: "secret123" },
      });
      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/auth/email?register=true",
          expect.objectContaining({
            method: "POST",
            body: JSON.stringify({
              email: "user@example.com",
              password: "secret123",
            }),
          }),
        );
        expect(setToast).toHaveBeenCalledWith({
          message: "Email sent",
          type: "success",
        });
        expect(
          screen.getByText(
            /Please check your email for a verification link/i,
          ),
        ).toBeDefined();
        expect(mockRefresh).not.toHaveBeenCalled();
      });
    });

    it("shows an error toast when registration fails", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "User already registered" }),
      });
      const setToast = vi.fn();
      const { container } = renderForm({ isSignUp: true }, setToast);

      fillLoginFields("user@example.com", "secret123");
      fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
        target: { value: "secret123" },
      });
      fireEvent.submit(container.querySelector("form")!);

      await waitFor(() => {
        expect(setToast).toHaveBeenCalledWith({
          message: "User already registered",
          type: "error",
        });
        expect(
          screen.queryByText(
            /Please check your email for a verification link/i,
          ),
        ).toBeNull();
      });
    });
  });
});
