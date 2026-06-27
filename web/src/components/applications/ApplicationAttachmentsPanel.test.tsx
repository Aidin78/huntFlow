import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationAttachmentsPanel } from "./ApplicationAttachmentsPanel";

const fetchApplicationAttachments = vi.fn();
const uploadApplicationAttachment = vi.fn();

vi.mock("@/lib/seeker-attachments-api", () => ({
  fetchApplicationAttachments: (...args: unknown[]) => fetchApplicationAttachments(...args),
  uploadApplicationAttachment: (...args: unknown[]) => uploadApplicationAttachment(...args),
  deleteApplicationAttachment: vi.fn(),
}));

vi.mock("@/lib/authenticated-file", () => ({
  fetchAttachmentBlobUrl: vi.fn(),
}));

describe("ApplicationAttachmentsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApplicationAttachments.mockResolvedValue({ items: [] });
    uploadApplicationAttachment.mockResolvedValue({
      attachment: {
        id: "att-1",
        applicationId: "app-1",
        filename: "portfolio.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024,
        notes: null,
        createdAt: new Date().toISOString(),
      },
    });
  });

  it("uploads file via API", async () => {
    const user = userEvent.setup();

    render(<ApplicationAttachmentsPanel applicationId="app-1" />);

    await user.click(screen.getByRole("button", { name: "Upload file" }));

    const input = screen.getByLabelText("File");
    const file = new File(["%PDF-1.4"], "portfolio.pdf", { type: "application/pdf" });
    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: "Upload" }));

    await waitFor(() => {
      expect(uploadApplicationAttachment).toHaveBeenCalledWith("app-1", file, undefined);
    });
  });
});
