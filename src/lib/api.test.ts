import { describe, it, expect } from "vitest";
import { unwrap } from "./api";
import type { ApiResponse } from "./types";

describe("unwrap", () => {
  it("returns data on success", () => {
    const res: ApiResponse<{ name: string }> = {
      success: true,
      data: { name: "test" },
    };
    expect(unwrap(res)).toEqual({ name: "test" });
  });

  it("throws on failure", () => {
    const res: ApiResponse<string> = {
      success: false,
      error: { code: "ERR", message: "Something went wrong" },
    };
    expect(() => unwrap(res)).toThrow("Something went wrong");
  });

  it("throws on success without data", () => {
    const res: ApiResponse<string> = {
      success: true,
      data: undefined,
    };
    expect(() => unwrap(res)).toThrow("Request failed");
  });

  it("throws generic message when no error message", () => {
    const res: ApiResponse<string> = {
      success: false,
    };
    expect(() => unwrap(res)).toThrow("Request failed");
  });
});
