import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFormattedAmount = (amount: number | undefined) =>
  new Intl.NumberFormat("ru-RU").format(amount || 0);
