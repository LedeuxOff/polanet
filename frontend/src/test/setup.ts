import * as matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

// Extend vitest expect with jest-dom matchers
expect.extend(matchers);

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: function (query: string) {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: function () {},
      removeListener: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      dispatchEvent: function () {
        return false;
      },
    };
  },
});

// Mock IntersectionObserver
class IntersectionObserverMock {
  observe: () => void;
  disconnect: () => void;
  unobserve: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(_callback: any, _options?: any) {
    this.observe = () => {};
    this.disconnect = () => {};
    this.unobserve = () => {};
  }
}

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe: () => void;
  disconnect: () => void;
  unobserve: () => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(_callback: any) {
    this.observe = () => {};
    this.disconnect = () => {};
    this.unobserve = () => {};
  }
}

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: ResizeObserverMock,
});
