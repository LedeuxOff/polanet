// Test zod schemas using vitest globals
import { newTransportCardSchema, transportCardSchema } from "./transport-card-types";

describe("newTransportCardSchema", () => {
  it("should validate a correct transport card", () => {
    const result = newTransportCardSchema.safeParse({
      cardNumber: "1234567890123456",
      status: "active",
    });

    expect(result.success).toBe(true);
  });

  it("should validate with default status when not provided", () => {
    const result = newTransportCardSchema.safeParse({
      cardNumber: "1234567890123456",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("active");
    }
  });

  it("should allow inactive status", () => {
    const result = newTransportCardSchema.safeParse({
      cardNumber: "1234567890123456",
      status: "inactive",
    });

    expect(result.success).toBe(true);
  });

  it("should fail when cardNumber is empty string", () => {
    const result = newTransportCardSchema.safeParse({
      cardNumber: "",
      status: "active",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe("Номер карты обязателен");
    }
  });

  it("should fail when cardNumber is missing", () => {
    const result = newTransportCardSchema.safeParse({
      status: "active",
    });

    expect(result.success).toBe(false);
  });

  it("should coerce driverId to number", () => {
    const result = newTransportCardSchema.safeParse({
      cardNumber: "1234567890123456",
      driverId: "123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.driverId).toBe(123);
    }
  });

  it("should allow null driverId", () => {
    const result = newTransportCardSchema.safeParse({
      cardNumber: "1234567890123456",
      driverId: null,
    });

    expect(result.success).toBe(true);
  });

  it("should fail with invalid status", () => {
    const result = newTransportCardSchema.safeParse({
      cardNumber: "1234567890123456",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      status: "invalid" as any,
    });

    expect(result.success).toBe(false);
  });
});

describe("transportCardSchema", () => {
  it("should validate a correct transport card", () => {
    const result = transportCardSchema.safeParse({
      cardNumber: "1234567890123456",
      status: "active",
      driverId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should allow optional cardNumber", () => {
    const result = transportCardSchema.safeParse({
      driverId: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should coerce driverId to number", () => {
    const result = transportCardSchema.safeParse({
      cardNumber: "1234567890123456",
      driverId: "456",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.driverId).toBe(456);
    }
  });

  it("should allow null driverId", () => {
    const result = transportCardSchema.safeParse({
      cardNumber: "1234567890123456",
      driverId: null,
    });

    expect(result.success).toBe(true);
  });
});
