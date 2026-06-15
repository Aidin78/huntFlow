import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApplicationStatusHistory } from "./ApplicationStatusHistory";

describe("ApplicationStatusHistory", () => {
  it("renders status transition events", () => {
    render(
      <ApplicationStatusHistory
        events={[
          {
            from: "APPLIED",
            to: "INTERVIEW",
            at: new Date("2026-06-01T10:00:00Z").toISOString(),
            note: "Phone screen scheduled",
          },
        ]}
      />,
    );

    expect(screen.getByText(/Applied → Interview/i)).toBeInTheDocument();
    expect(screen.getByText("Phone screen scheduled")).toBeInTheDocument();
  });

  it("shows empty state when there are no events", () => {
    render(<ApplicationStatusHistory events={[]} />);
    expect(screen.getByText(/No status changes recorded yet/i)).toBeInTheDocument();
  });
});
