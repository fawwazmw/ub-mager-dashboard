import { describe, it, expect, vi, beforeEach } from "vitest";
import { downloadCSV } from "./csv";

describe("downloadCSV", () => {
  let mockClick: ReturnType<typeof vi.fn>;
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockClick = vi.fn();
    mockCreateObjectURL = vi.fn(() => "blob:test-url");
    mockRevokeObjectURL = vi.fn();

    vi.stubGlobal("URL", {
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });

    vi.spyOn(document, "createElement").mockReturnValue({
      href: "",
      download: "",
      click: mockClick,
    } as unknown as HTMLAnchorElement);
  });

  it("creates and downloads CSV file", () => {
    downloadCSV(
      ["Name", "Age"],
      [["Alice", 30], ["Bob", 25]],
      "test.csv",
    );

    expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);
    expect(mockClick).toHaveBeenCalledTimes(1);
    expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:test-url");
  });

  it("does nothing with empty rows", () => {
    downloadCSV(["Name"], [], "empty.csv");

    expect(mockCreateObjectURL).not.toHaveBeenCalled();
    expect(mockClick).not.toHaveBeenCalled();
  });

  it("escapes values with commas", () => {
    downloadCSV(
      ["Address"],
      [["123 Main St, Apt 4"]],
      "test.csv",
    );

    expect(mockCreateObjectURL).toHaveBeenCalled();
    const blobArg = mockCreateObjectURL.mock.calls[0][0] as Blob;
    expect(blobArg).toBeInstanceOf(Blob);
  });
});
