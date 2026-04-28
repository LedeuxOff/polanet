// Test utils cn function using vitest globals
import { cn } from "./utils";

describe("cn utility", () => {
  it("should return empty string when called with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("should return the same class when called with a single class", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("should merge multiple classes", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes (falsy values)", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("text-red-500", false && "bg-blue-500")).toBe("text-red-500");
  });

  it("should handle conditional classes (truthy values)", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("text-red-500", true && "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("should handle array of classes", () => {
    expect(cn("text-red-500", ["bg-blue-500", "p-4"])).toBe("text-red-500 bg-blue-500 p-4");
  });

  it("should merge conflicting Tailwind classes (last one wins)", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("should merge padding classes correctly", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("should preserve unique classes and merge conflicting ones", () => {
    expect(cn("p-4", "text-red-500", "p-2")).toBe("text-red-500 p-2");
  });
});
