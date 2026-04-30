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
