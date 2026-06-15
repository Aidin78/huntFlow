import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationInterviewsPanel } from "./ApplicationInterviewsPanel";

const fetchApplicationInterviews = vi.fn();
const createInterview = vi.fn();

vi.mock("@/lib/seeker-schedule-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/seeker-schedule-api")>();
  return {
    ...actual,
    fetchApplicationInterviews: (...args: unknown[]) => fetchApplicationInterviews(...args),
    createInterview: (...args: unknown[]) => createInterview(...args),
  };
});

describe("ApplicationInterviewsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApplicationInterviews.mockResolvedValue({ items: [] });
    createInterview.mockResolvedValue({
      interview: {
        id: "int-1",
        applicationId: "app-1",
        title: "Tech screen",
        scheduledAt: "2026-07-01T14:00:00.000Z",
        durationMinutes: 45,
        location: null,
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  it("submits POST with title and scheduledAt", async () => {
    const user = userEvent.setup();

    render(<ApplicationInterviewsPanel applicationId="app-1" />);

    await user.click(screen.getByRole("button", { name: "Add interview" }));
    await user.type(screen.getByLabelText("Title"), "Tech screen");
    await user.click(screen.getByRole("button", { name: "Save interview" }));

    await waitFor(() => {
      expect(createInterview).toHaveBeenCalledWith(
        "app-1",
        expect.objectContaining({
          title: "Tech screen",
          scheduledAt: expect.any(String),
        }),
      );
    });
  });
});
