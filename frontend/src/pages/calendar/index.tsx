import { useIsMobile } from "@/hooks";
import { CalendarMobile } from "./ui/calendar-mobile";
import { CalendarDesktop } from "./ui/calendar-desktop";

// Основной компонент
export function CalendarPage() {
  const isMobile = useIsMobile();

  return <div>{isMobile ? <CalendarMobile /> : <CalendarDesktop />}</div>;
}
