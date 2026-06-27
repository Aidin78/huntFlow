import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationLinksPanel } from "./ApplicationLinksPanel";

const fetchApplicationLinks = vi.fn();
const createLink = vi.fn();

vi.mock("@/lib/seeker-links-api", () => ({
  fetchApplicationLinks: (...args: unknown[]) => fetchApplicationLinks(...args),
  createLink: (...args: unknown[]) => createLink(...args),
  updateLink: vi.fn(),
  deleteLink: vi.fn(),
}));

describe("ApplicationLinksPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApplicationLinks.mockResolvedValue({ items: [] });
    createLink.mockResolvedValue({
      link: {
        id: "link-1",
        applicationId: "app-1",
        label: "Portfolio",
        url: "https://example.com/portfolio",
        createdAt: new Date().toISOString(),
      },
    });
  });

  it("creates link via API", async () => {
    const user = userEvent.setup();

    render(<ApplicationLinksPanel applicationId="app-1" />);

    await user.click(screen.getByRole("button", { name: "Add link" }));
    await user.selectOptions(screen.getByLabelText("Label"), "Portfolio");
    await user.type(screen.getByLabelText("URL"), "https://example.com/portfolio");
    await user.click(screen.getByRole("button", { name: "Save link" }));

    await waitFor(() => {
      expect(createLink).toHaveBeenCalledWith(
        "app-1",
        expect.objectContaining({
          label: "Portfolio",
          url: "https://example.com/portfolio",
        }),
      );
    });
  });

  it("renders read-only links from initial items", () => {
    render(
      <ApplicationLinksPanel
        applicationId="app-1"
        readOnly
        initialItems={[
          {
            id: "link-1",
            applicationId: "app-1",
            label: "Company page",
            url: "https://example.com/about",
            createdAt: new Date().toISOString(),
          },
        ]}
      />,
    );

    expect(screen.getByText("https://example.com/about")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add link" })).not.toBeInTheDocument();
  });
});
