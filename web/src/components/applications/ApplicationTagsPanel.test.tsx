import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationTagsPanel } from "./ApplicationTagsPanel";

const fetchApplicationTags = vi.fn();
const fetchSeekerTags = vi.fn();
const attachApplicationTagByName = vi.fn();
const detachApplicationTag = vi.fn();

vi.mock("@/lib/seeker-tags-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/seeker-tags-api")>();
  return {
    ...actual,
    fetchApplicationTags: (...args: unknown[]) => fetchApplicationTags(...args),
    fetchSeekerTags: (...args: unknown[]) => fetchSeekerTags(...args),
    attachApplicationTagByName: (...args: unknown[]) => attachApplicationTagByName(...args),
    detachApplicationTag: (...args: unknown[]) => detachApplicationTag(...args),
  };
});

describe("ApplicationTagsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApplicationTags.mockResolvedValue({
      items: [{ id: "tag-1", name: "Remote", color: "#2563eb" }],
    });
    fetchSeekerTags.mockResolvedValue({
      items: [
        {
          id: "tag-1",
          name: "Remote",
          color: "#2563eb",
          usageCount: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
    attachApplicationTagByName.mockResolvedValue({
      tag: { id: "tag-2", name: "Priority", color: "#db2777" },
    });
    detachApplicationTag.mockResolvedValue(undefined);
  });

  it("renders existing tags", async () => {
    render(<ApplicationTagsPanel applicationId="app-1" />);
    await waitFor(() => {
      expect(screen.getByText("Remote")).toBeInTheDocument();
    });
  });

  it("attaches a new tag by name", async () => {
    const user = userEvent.setup();
    render(<ApplicationTagsPanel applicationId="app-1" />);

    await waitFor(() => {
      expect(screen.getByLabelText("Add tag")).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText("Add tag"), "Priority");
    await user.click(screen.getByRole("button", { name: "Add tag" }));

    await waitFor(() => {
      expect(attachApplicationTagByName).toHaveBeenCalledWith(
        "app-1",
        expect.objectContaining({ name: "Priority" }),
      );
    });
  });

  it("removes a tag chip", async () => {
    const user = userEvent.setup();
    render(<ApplicationTagsPanel applicationId="app-1" initialTags={[{ id: "tag-1", name: "Remote", color: "#2563eb" }]} />);

    await waitFor(() => {
      expect(screen.getByText("Remote")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Remove Remote" }));

    await waitFor(() => {
      expect(detachApplicationTag).toHaveBeenCalledWith("app-1", "tag-1");
    });
  });
});
