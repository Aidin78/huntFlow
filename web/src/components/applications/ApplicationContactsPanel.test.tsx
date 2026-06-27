import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApplicationContactsPanel } from "./ApplicationContactsPanel";

const fetchApplicationContacts = vi.fn();
const createContact = vi.fn();

vi.mock("@/lib/seeker-contacts-api", () => ({
  fetchApplicationContacts: (...args: unknown[]) => fetchApplicationContacts(...args),
  createContact: (...args: unknown[]) => createContact(...args),
  updateContact: vi.fn(),
  deleteContact: vi.fn(),
}));

describe("ApplicationContactsPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchApplicationContacts.mockResolvedValue({ items: [] });
    createContact.mockResolvedValue({
      contact: {
        id: "contact-1",
        applicationId: "app-1",
        name: "Jane Recruiter",
        role: "Recruiter",
        title: null,
        email: "jane@example.com",
        phone: null,
        linkedin: null,
        notes: null,
        createdAt: new Date().toISOString(),
      },
    });
  });

  it("creates contact via API", async () => {
    const user = userEvent.setup();

    render(<ApplicationContactsPanel applicationId="app-1" />);

    await user.click(screen.getByRole("button", { name: "Add contact" }));
    await user.type(screen.getByLabelText("Name"), "Jane Recruiter");
    await user.type(screen.getByLabelText("Email"), "jane@example.com");
    await user.click(screen.getByRole("button", { name: "Save contact" }));

    await waitFor(() => {
      expect(createContact).toHaveBeenCalledWith(
        "app-1",
        expect.objectContaining({
          name: "Jane Recruiter",
          email: "jane@example.com",
        }),
      );
    });
  });
});
