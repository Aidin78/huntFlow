import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PushNotificationSettings } from "./PushNotificationSettings";

const getPushSubscriptionState = vi.fn();
const subscribeToPush = vi.fn();

vi.mock("@/lib/push-notifications", () => ({
  getPushSubscriptionState: () => getPushSubscriptionState(),
  subscribeToPush: (...args: unknown[]) => subscribeToPush(...args),
  unsubscribeFromPush: vi.fn(),
}));

describe("PushNotificationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPushSubscriptionState.mockResolvedValue("unsubscribed");
  });

  it("shows enable button when unsubscribed", async () => {
    render(<PushNotificationSettings />);
    expect(await screen.findByRole("button", { name: /enable browser notifications/i })).toBeInTheDocument();
  });
});
