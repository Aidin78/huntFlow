import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ContactForm } from "./ContactForm";

const submitContactForm = vi.fn();

vi.mock("@/lib/contact-api", () => ({
  submitContactForm: (...args: unknown[]) => submitContactForm(...args),
}));

describe("ContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    submitContactForm.mockResolvedValue({
      inquiry: { id: "inq-1", createdAt: new Date().toISOString() },
    });
  });

  it("shows success message after submit", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Name"), "Alex Morgan");
    await user.type(screen.getByLabelText("Email"), "alex@example.com");
    await user.type(screen.getByLabelText("Subject"), "Help");
    await user.type(screen.getByLabelText("Message"), "I need assistance.");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(submitContactForm).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Alex Morgan",
          email: "alex@example.com",
          subject: "Help",
          message: "I need assistance.",
        }),
      );
    });

    expect(
      await screen.findByText(/we received your message and will reply within 2 business days/i),
    ).toBeInTheDocument();
  });
});
