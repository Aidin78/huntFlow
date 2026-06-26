import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SeekerNotificationSettings } from "./SeekerNotificationSettings";

const fetchSeekerNotificationPreferences = vi.fn();
const updateSeekerNotificationPreferences = vi.fn();

vi.mock("@/lib/seeker-settings-api", () => ({
  fetchSeekerNotificationPreferences: (...args: unknown[]) =>
    fetchSeekerNotificationPreferences(...args),
  updateSeekerNotificationPreferences: (...args: unknown[]) =>
    updateSeekerNotificationPreferences(...args),
}));

describe("SeekerNotificationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSeekerNotificationPreferences.mockResolvedValue({
      notifyNewApplication: true,
      notifyNewMessage: true,
      notifyInterviewReminder: true,
      notifyWeeklySummary: false,
      notifyStatusEvent: true,
      updatedAt: new Date().toISOString(),
    });
    updateSeekerNotificationPreferences.mockResolvedValue({
      notifyNewApplication: true,
      notifyNewMessage: false,
      notifyInterviewReminder: true,
      notifyWeeklySummary: false,
      notifyStatusEvent: true,
      updatedAt: new Date().toISOString(),
    });
  });

  it("toggles a preference", async () => {
    const user = userEvent.setup();
    render(<SeekerNotificationSettings />);

    const toggle = (await screen.findAllByRole("switch"))[0]!;
    await user.click(toggle);

    await waitFor(() => {
      expect(updateSeekerNotificationPreferences).toHaveBeenCalledWith({
        notifyNewMessage: false,
      });
    });
  });
});
