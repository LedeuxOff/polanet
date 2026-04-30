import axios from "axios";

const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_API_URL = "https://new.smsgorod.ru/apiSms/create";

/**
 * Результат отправки SMS
 */
export type SmsResult = {
  success: boolean;
  status?: string;
  messageId?: string;
  errorMsg?: string;
};

/**
 * Отправляет SMS сообщение через smsgorod.ru API
 * @param phone - Номер телефона получателя (в формате 79xxxxxxxxx)
 * @param text - Текст сообщения
 * @returns Результат отправки
 */
export async function sendSms(phone: string, text: string): Promise<SmsResult> {
  try {
    if (!SMS_API_KEY) {
      throw new Error("SMS_API_KEY не настроен в environment variables");
    }

    console.log(`[SMS smsgorod] Отправка на номер: ${phone}`);
    console.log(`[SMS smsgorod] Сообщение: ${text}`);

    const response = await axios.post(
      SMS_API_URL,
      {
        apiKey: SMS_API_KEY,
        sms: [
          {
            channel: "char",
            text: text,
            phone: phone,
            sender: "VIRTA",
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 10000,
      },
    );

    console.log(`[SMS smsgorod] Ответ от API:`, JSON.stringify(response.data));

    // Проверяем, что ответ содержит успешный статус
    const data = response.data as any;

    // Проверяем статус в ответе
    const smsData = Array.isArray(data.data) ? data.data[0] : data.data;
    const apiStatus = smsData?.status || data.status;

    const isSuccess =
      apiStatus === "sent" || apiStatus === "delivered" || data.status === "success";

    if (isSuccess) {
      console.log(`[SMS smsgorod] Успешно отправлено, статус: ${apiStatus}`);
      return {
        success: true,
        status: apiStatus,
        messageId: smsData?.id || data.id,
      };
    }

    console.log(
      `[SMS smsgorod] Ошибка от API: ${smsData?.errorDescription || data.errorDescription || data.error}`,
    );
    return {
      success: false,
      errorMsg:
        smsData?.errorDescription ||
        data.errorDescription ||
        data.error ||
        "Неизвестная ошибка smsgorod",
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[SMS smsgorod] Исключение: ${error.message}`);
      return {
        success: false,
        errorMsg: error.message,
      };
    }
    return {
      success: false,
      errorMsg: "Неизвестная ошибка при отправке SMS",
    };
  }
}

/**
 * Форматирует дату и время в читаемый вид
 */
function formatDateTime(dateTime: string): string {
  try {
    const date = new Date(dateTime);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateTime;
  }
}

/**
 * Формирует ФИО из частей
 */
function formatFio(lastName: string, firstName: string, middleName?: string | null): string {
  if (middleName) {
    return `${lastName} ${firstName} ${middleName}`;
  }
  return `${lastName} ${firstName}`;
}

/**
 * Отправляет уведомление клиенту о назначении доставки
 */
export async function sendClientNotification(
  clientPhone: string,
  dateTime: string,
  driverFio: string,
  driverPhone: string,
): Promise<SmsResult> {
  const formattedDateTime = formatDateTime(dateTime);
  const text = `PolaNet. Вам назначена доставка на ${formattedDateTime}. Водитель ${driverFio}. Телефон для связи ${driverPhone}`;
  return await sendSms(clientPhone, text);
}

/**
 * Отправляет уведомление водителю о назначении доставки
 */
export async function sendDriverNotification(
  driverPhone: string,
  dateTime: string,
  address: string,
  contactPersonFio: string,
  contactPersonPhone: string,
  carBrand: string,
  carLicensePlate: string,
): Promise<SmsResult> {
  const formattedDateTime = formatDateTime(dateTime);
  const addressWithHyphens = address.replace(/\s/g, "-");
  const carBrandNoSpaces = carBrand.replace(/\s/g, "");
  const text = `PolaNet. Вы назначены на доставку. Дата - ${formattedDateTime}. Адрес - ${addressWithHyphens}. Контактное лицо - ${contactPersonFio} ${contactPersonPhone}. Автомобиль - ${carBrandNoSpaces} (${carLicensePlate})`;
  return await sendSms(driverPhone, text);
}
