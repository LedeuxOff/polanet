import axios from "axios";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq, isNotNull } from "drizzle-orm";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

/**
 * Результат отправки Telegram-сообщения
 */
export type TelegramResult = {
  success: boolean;
  messageId?: number;
  errorMsg?: string;
};

/**
 * Отправляет сообщение через Telegram Bot API
 * @param chatId - ID чата получателя
 * @param text - Текст сообщения
 * @returns Результат отправки
 */
export async function sendTelegramMessage(chatId: string, text: string): Promise<TelegramResult> {
  try {
    if (!TELEGRAM_BOT_TOKEN) {
      throw new Error("TELEGRAM_BOT_TOKEN не настроен в environment variables");
    }

    console.log(`[Telegram] Отправка на чат: ${chatId}`);
    console.log(`[Telegram] Сообщение: ${text}`);

    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    console.log(`[Telegram] Ответ от API:`, JSON.stringify(response.data));

    if (response.data.ok) {
      const messageId = response.data.result?.message_id;
      console.log(`[Telegram] Успешно отправлено, message_id: ${messageId}`);
      return {
        success: true,
        messageId: messageId,
      };
    }

    console.log(`[Telegram] Ошибка от API: ${response.data.description}`);
    return {
      success: false,
      errorMsg: response.data.description,
    };
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[Telegram] Исключение: ${error.message}`);
      return {
        success: false,
        errorMsg: error.message,
      };
    }
    return {
      success: false,
      errorMsg: "Неизвестная ошибка при отправке Telegram",
    };
  }
}

/**
 * Отправляет сообщение пользователю по его Telegram Chat ID
 * (если пользователь указал chat_id в профиле)
 */
export async function sendToUser(chatId: string, text: string): Promise<TelegramResult> {
  return sendTelegramMessage(chatId, text);
}

/**
 * Ищет пользователя по email и отправляет ему сообщение
 */
export async function sendToUserByEmail(email: string, text: string): Promise<TelegramResult> {
  const user = db
    .select({ telegramChatId: users.telegramChatId })
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user?.telegramChatId) {
    console.log(`[Telegram] У пользователя с email ${email} не привязан Telegram`);
    return {
      success: false,
      errorMsg: "Telegram Chat ID не найден",
    };
  }

  return sendTelegramMessage(user.telegramChatId, text);
}

/**
 * Отправляет уведомление всем пользователям с привязанным Telegram
 */
export async function sendToAllUsersWithTelegram(text: string): Promise<{
  success: number;
  failed: number;
  errors?: string[];
}> {
  const usersWithTelegram = db
    .select({ telegramChatId: users.telegramChatId })
    .from(users)
    .where(isNotNull(users.telegramChatId))
    .all();

  const results: { success: number; failed: number; errors: string[] } = {
    success: 0,
    failed: 0,
    errors: [],
  };

  for (const user of usersWithTelegram) {
    try {
      const result = await sendTelegramMessage(user.telegramChatId!, text);
      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        if (result.errorMsg) results.errors.push(result.errorMsg);
      }
    } catch {
      results.failed++;
    }
  }

  return results;
}

/**
 * Отправляет уведомление клиенту о назначении доставки
 */
export async function sendClientNotification(
  chatId: string,
  dateTime: string,
  driverFio: string,
  driverPhone: string,
): Promise<TelegramResult> {
  const formattedDateTime = formatDateTime(dateTime);
  const text = `📦 <b>Вам назначена доставка</b>

📅 Дата: ${formattedDateTime}
🚗 Водитель: ${driverFio}
📞 Телефон: ${driverPhone}`;

  return await sendTelegramMessage(chatId, text);
}

/**
 * Отправляет уведомление водителю о назначении доставки
 */
export async function sendDriverNotification(
  chatId: string,
  dateTime: string,
  address: string,
  contactPersonFio: string,
  contactPersonPhone: string,
  carBrand: string,
  carLicensePlate: string,
): Promise<TelegramResult> {
  const formattedDateTime = formatDateTime(dateTime);
  const text = `🚚 <b>Вы назначены на доставку</b>

📅 Дата: ${formattedDateTime}
📍 Адрес: ${address}
👤 Контактное лицо: ${contactPersonFio}
📞 Телефон: ${contactPersonPhone}
🚗 Автомобиль: ${carBrand} (${carLicensePlate})`;

  return await sendTelegramMessage(chatId, text);
}

/**
 * Отправляет пароль для доступа к административной панели
 */
export async function sendPasswordNotification(
  chatId: string,
  email: string,
  password: string,
): Promise<TelegramResult> {
  const text = `🔑 <b>Ваш пароль для административной панели PolaNet</b>

📧 Email: ${email}
🔐 Пароль: <b>${password}</b>

Пожалуйста, сохраните этот пароль в безопасном месте.`;

  return await sendTelegramMessage(chatId, text);
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
