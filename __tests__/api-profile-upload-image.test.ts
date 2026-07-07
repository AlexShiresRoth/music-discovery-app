import { DELETE } from "@/app/api/profile/delete-image/route";
import { POST } from "@/app/api/profile/upload-image/route";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetUser = vi.fn();
vi.mock("@/lib/auth", () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
  createAdminClient: vi.fn(() => ({ storage: mockStorage })),
}));

const { mockFrom, mockUpload, mockGetPublicUrl, mockRemove } = vi.hoisted(
  () => ({
    mockFrom: vi.fn(),
    mockUpload: vi.fn(),
    mockGetPublicUrl: vi.fn(),
    mockRemove: vi.fn(),
  }),
);

const mockStorage = {
  from: mockFrom,
};

function makeUploadRequest(file?: File) {
  const formData = new FormData();
  if (file) formData.append("file", file);
  return new Request("http://localhost/api/profile/upload-image", {
    method: "POST",
    body: formData,
  });
}

function makeDeleteRequest(body: object) {
  return new Request("http://localhost/api/profile/delete-image", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const testFile = new File(["image-data"], "photo.png", { type: "image/png" });
const PUBLIC_URL =
  "https://project.supabase.co/storage/v1/object/public/profile-images/profile/user-1/photo.png";

describe("POST /api/profile/upload-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: PUBLIC_URL } });
    mockFrom.mockReturnValue({
      upload: mockUpload,
      getPublicUrl: mockGetPublicUrl,
    });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await POST(makeUploadRequest(testFile));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when no file is attached", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await POST(makeUploadRequest());
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("File is required");
  });

  it("uploads file and returns the public URL", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await POST(makeUploadRequest(testFile));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.publicUrl).toBe(PUBLIC_URL);
    const [uploadPath, , uploadOpts] = mockUpload.mock.calls[0];
    expect(uploadPath).toMatch(/^profile\/user-1\//);
    expect(uploadOpts).toEqual({ upsert: true });
  });

  it("scopes the upload path to the authenticated user's ID", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "other-user" } } });

    await POST(makeUploadRequest(testFile));

    expect(mockUpload).toHaveBeenCalledWith(
      expect.stringContaining("profile/other-user/"),
      expect.anything(),
      expect.anything(),
    );
  });

  it("sanitizes path separators in the filename", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    const maliciousFile = new File(["data"], "../../../evil.png", {
      type: "image/png",
    });

    await POST(makeUploadRequest(maliciousFile));

    const uploadPath = mockUpload.mock.calls[0][0] as string;
    expect(uploadPath).toMatch(/^profile\/user-1\//);
    const filename = uploadPath.split("/").pop()!;
    expect(filename).not.toContain("..");
    expect(filename).not.toMatch(/[/\\]/);
  });

  it("returns 500 when storage upload fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockUpload.mockResolvedValue({
      error: { message: "Storage quota exceeded" },
    });

    const response = await POST(makeUploadRequest(testFile));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Storage quota exceeded");
  });

  it("calls getPublicUrl with the same sanitized path used for upload", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    await POST(makeUploadRequest(testFile));

    const uploadPath = mockUpload.mock.calls[0][0] as string;
    expect(mockGetPublicUrl).toHaveBeenCalledWith(uploadPath);
  });
});

describe("DELETE /api/profile/delete-image", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRemove.mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ remove: mockRemove });
  });

  it("returns 401 when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const response = await DELETE(makeDeleteRequest({ safeName: "photo.png" }));
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 400 when safeName is missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await DELETE(makeDeleteRequest({}));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe("File name is required");
  });

  it("removes the file and returns success", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });

    const response = await DELETE(makeDeleteRequest({ safeName: "photo.png" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Image deleted");
    expect(mockRemove).toHaveBeenCalledWith(["profile/user-1/photo.png"]);
  });

  it("scopes the remove path to the authenticated user's ID", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "other-user" } } });

    await DELETE(makeDeleteRequest({ safeName: "photo.png" }));

    expect(mockRemove).toHaveBeenCalledWith(["profile/other-user/photo.png"]);
  });

  it("returns 500 when storage remove fails", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockRemove.mockResolvedValue({ error: { message: "Object not found" } });

    const response = await DELETE(makeDeleteRequest({ safeName: "photo.png" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("Object not found");
  });
});
