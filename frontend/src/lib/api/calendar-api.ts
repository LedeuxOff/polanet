import { request } from ".";
import type { CalendarDelivery } from "../types/delivery-types";

export const calendarApi = {
  /**
   * Получить доставки для календаря
   * @param startDate Дата начала в формате YYYY-MM-DD
   * @param endDate Дата окончания в формате YYYY-MM-DD
   */
  getDeliveries: (startDate: string, endDate: string) => {
    const url = `/deliveries/calendar?startDate=${startDate}&endDate=${endDate}`;
    return request<CalendarDelivery[]>(url);
  },
};
