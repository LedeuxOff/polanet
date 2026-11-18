import { Car, DeliveryWithIncome, User } from "@/lib/types";

export const getDriverName = (drivers: User[], driverId: number) => {
  const driver = drivers.find((d) => d.id === driverId);
  if (!driver) return "—";
  const initials = [driver.firstName, driver.middleName]
    .filter(Boolean)
    .map((n) => `${String(n)[0]}.`)
    .join("");
  return `${driver.lastName} ${initials}`.trim();
};

export const getCarName = (cars: Car[], carId: number) => {
  const car = cars.find((c) => c.id === carId);
  if (!car) return "—";
  return `${car.brand} · ${car.licensePlate}`;
};

export const getDeliveryAmount = (delivery: DeliveryWithIncome) =>
  delivery.income?.amount ?? delivery.amount ?? 0;

export const statusStyles = {
  completed: {
    badge: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
    dot: "bg-green-500",
    accent: "border-l-green-500",
  },
  in_progress: {
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
    dot: "bg-blue-500 animate-pulse",
    accent: "border-l-blue-500",
  },
} as const;
