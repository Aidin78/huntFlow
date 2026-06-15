import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationPipelineControl } from "./ApplicationPipelineControl";

const updateEmployerApplicationStatus = vi.fn();

vi.mock("@/lib/employer-applications-api", () => ({
  updateEmployerApplicationStatus: (...args: unknown[]) => updateEmployerApplicationStatus(...args),
}));

describe("ApplicationPipelineControl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateEmployerApplicationStatus.mockResolvedValue({
      application: { id: "app-1", status: "INTERVIEW", updatedAt: new Date().toISOString() },
      event: { from: "APPLIED", to: "INTERVIEW", at: new Date().toISOString(), note: null },
    });
  });

  it("calls PATCH when a pipeline status is selected", async () => {
    const onUpdated = vi.fn();
    const user = userEvent.setup();

    render(
      <ApplicationPipelineControl
        applicationId="app-1"
        currentStatus="APPLIED"
        onUpdated={onUpdated}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Interview" }));

    await waitFor(() => {
      expect(updateEmployerApplicationStatus).toHaveBeenCalledWith("app-1", {
        status: "INTERVIEW",
        note: undefined,
      });
    });
    expect(onUpdated).toHaveBeenCalledWith("INTERVIEW", expect.objectContaining({ to: "INTERVIEW" }));
  });
});
