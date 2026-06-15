import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ManualApplicationForm } from "./ManualApplicationForm";

const push = vi.fn();
const createManualApplication = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/seeker-applications-api", () => ({
  createManualApplication: (...args: unknown[]) => createManualApplication(...args),
}));

describe("ManualApplicationForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createManualApplication.mockResolvedValue({
      application: { id: "manual-app-1", title: "Backend Engineer", status: "APPLIED" },
    });
  });

  it("submits POST with form values", async () => {
    const user = userEvent.setup();

    render(<ManualApplicationForm />);

    await user.type(screen.getByLabelText("Company"), "Startup Inc");
    await user.type(screen.getByLabelText("Role title"), "Backend Engineer");
    await user.type(screen.getByLabelText("Location"), "Remote");
    await user.type(screen.getByLabelText("Notes"), "Referred by friend");
    await user.click(screen.getByRole("button", { name: "Add application" }));

    await waitFor(() => {
      expect(createManualApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          companyName: "Startup Inc",
          title: "Backend Engineer",
          location: "Remote",
          notes: "Referred by friend",
        }),
      );
    });
    expect(push).toHaveBeenCalledWith("/dashboard/seeker/applications/manual-app-1");
  });
});
