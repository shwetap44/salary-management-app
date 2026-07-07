import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Money } from "./Money";

describe("Money", () => {
  it("renders the amount with its currency code, never assuming USD", () => {
    render(<Money amount={1250000} currencyCode="INR" />);
    expect(screen.getByText("INR")).toBeInTheDocument();
    expect(screen.getByText("1,250,000")).toBeInTheDocument();
  });

  it("formats large numbers with thousands separators", () => {
    render(<Money amount={95000} currencyCode="USD" />);
    expect(screen.getByText("95,000")).toBeInTheDocument();
  });

  it("shows a clear empty state instead of a misleading zero", () => {
    render(<Money amount={null} currencyCode={null} />);
    expect(screen.getByText("No salary on record")).toBeInTheDocument();
  });
});
