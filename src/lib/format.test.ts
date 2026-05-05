import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("Rp 0");
  });

  it("formats thousands with dot separator", () => {
    const result = formatCurrency(25000);
    expect(result).toContain("Rp");
    expect(result).toContain("25");
  });

  it("formats large numbers", () => {
    const result = formatCurrency(1500000);
    expect(result).toContain("Rp");
    expect(result).toContain("1.500.000");
  });

  it("respects fractionDigits", () => {
    const result = formatCurrency(25000.5, 2);
    expect(result).toContain("Rp");
  });

  it("defaults to 0 fraction digits", () => {
    const result = formatCurrency(25000.99);
    expect(result).not.toContain("99");
  });
});
