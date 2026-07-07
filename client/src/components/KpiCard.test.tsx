import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { KpiCard } from "./KpiCard";

describe("KpiCard", () => {
  it("renders the label and value", () => {
    render(<KpiCard label="Total Headcount" value="10,000" />);
    expect(screen.getByText("Total Headcount")).toBeInTheDocument();
    expect(screen.getByText("10,000")).toBeInTheDocument();
  });

  it("renders an optional hint", () => {
    render(<KpiCard label="Average Salary" value="₹950,000" hint="Scoped to India (INR)" />);
    expect(screen.getByText("Scoped to India (INR)")).toBeInTheDocument();
  });

  it("omits the hint element when none is provided", () => {
    render(<KpiCard label="Departments" value="10" />);
    expect(screen.queryByText(/Scoped to/)).not.toBeInTheDocument();
  });
});
