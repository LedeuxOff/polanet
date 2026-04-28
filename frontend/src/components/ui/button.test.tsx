// Test Button component using vitest globals and React Testing Library
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button component", () => {
  it("should render the button with default text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeDefined();
  });

  it("should apply default variant classes", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-primary");
  });

  it("should apply destructive variant when specified", () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-destructive");
  });

  it("should apply outline variant when specified", () => {
    render(<Button variant="outline">Outline</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("border");
  });

  it("should apply secondary variant when specified", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-secondary");
  });

  it("should apply ghost variant when specified", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("hover:bg-accent");
  });

  it("should apply link variant when specified", () => {
    render(<Button variant="link">Link</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("text-primary");
  });

  it("should apply small size classes when specified", () => {
    render(<Button size="sm">Small</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-9");
  });

  it("should apply large size classes when specified", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-11");
  });

  it("should apply icon size classes when specified", () => {
    render(<Button size="icon">Icon</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("h-10");
    expect(button.className).toContain("w-10");
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("custom-class");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should call onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByRole("button").click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render children correctly", () => {
    render(
      <Button>
        <span>Custom Content</span>
      </Button>,
    );
    expect(screen.getByText("Custom Content")).toBeDefined();
  });
});
