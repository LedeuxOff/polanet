import { OrderHistory } from "@/lib/types";

export const getHistoryUserName = (item: OrderHistory) =>
  [
    item.userLastName,
    item.userFirstName && `${item.userFirstName.charAt(0)}.`,
    item.userMiddleName && `${item.userMiddleName.charAt(0)}.`,
  ]
    .filter(Boolean)
    .join(" ");

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getDayKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

export const getDayLabel = (iso: string) => {
  const day = startOfDay(new Date(iso)).getTime();
  const today = startOfDay(new Date()).getTime();
  const diffDays = Math.round((today - day) / 86_400_000);

  if (diffDays === 0) return "Сегодня";
  if (diffDays === 1) return "Вчера";

  const d = new Date(iso);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};

export const getTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
