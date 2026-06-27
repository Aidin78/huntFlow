import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminSupportPage from "@/app/dashboard/admin/support/page";

const fetchSupportInquiries = vi.fn();

vi.mock("@/lib/admin-support-api", () => ({
  fetchSupportInquiries: (...args: unknown[]) => fetchSupportInquiries(...args),
  fetchSupportInquiry: vi.fn(),
  updateSupportInquiry: vi.fn(),
}));

describe("AdminSupportPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSupportInquiries.mockResolvedValue({
      items: [
        {
          id: "inq-1",
          name: "Pat",
          email: "pat@example.com",
          subject: "Help",
          status: "OPEN",
          createdAt: new Date().toISOString(),
          resolvedAt: null,
        },
      ],
      nextCursor: null,
      hasMore: false,
    });
  });

  it("loads and shows support inquiries", async () => {
    render(<AdminSupportPage />);

    await waitFor(() => {
      expect(screen.getByText("Help")).toBeInTheDocument();
    });

    expect(fetchSupportInquiries).toHaveBeenCalled();
    expect(screen.getByText("pat@example.com")).toBeInTheDocument();
  });
});
