import axios from "axios";
import http from "http";
import https from "https";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq, isNotNull } from "drizzle-orm";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME;

/**
 * Обработка входящих сообщений от Telegram
 */
export async function handleTelegramWebhook(body: any): Promise<{ ok: boolean }> {
  try {
    console.log("[Telegram Bot] Получено обновление:", JSON.stringify(body, null, 2));

    const update = body;

    // Проверяем, что это сообщение
    if (!update.message) {
      return { ok: true };
    }

    const message = update.message;
    const chatId = message.chat.id; // Оставляем как число для Telegram API
    const text = message.text?.trim();

    // Игнорируем команды от других чатов
    if (!text) {
      return { ok: true };
    }

    // Обрабатываем команду /start
    if (text === "/start") {
      await handleStartCommand(chatId);
      return { ok: true };
    }

    // Проверяем, не отправляет ли пользователь номер телефона
    const phoneMatch = text.match(/^\+?\d{10,12}$/);
    if (phoneMatch) {
      await handlePhoneLink(chatId, phoneMatch[0]);
      return { ok: true };
    }

    // Если пользователь уже привязан, игнорируем сообщения
    const linkedUser = await findUserByTelegramChatId(String(chatId));
    if (linkedUser) {
      await sendMessage(chatId, "✅ Ваш Telegram уже привязан к аккаунту.");
      return { ok: true };
    }

    // Пользователь не привязан - отправляем инструкцию
    await sendMessage(chatId, getStartInstruction());
    return { ok: true };
  } catch (error) {
    console.error("[Telegram Bot] Ошибка обработки:", error);
    return { ok: true }; // Telegram требует отвечать даже при ошибках
  }
}

/**
 * Обработка команды /start
 */
async function handleStartCommand(chatId: number) {
  // Проверяем, привязан ли уже этот chatId
  const existingUser = await findUserByTelegramChatId(String(chatId));

  if (existingUser) {
    const userFio = `${existingUser.lastName} ${existingUser.firstName}`;
    await sendMessage(
      chatId,
      `✅ <b>Telegram уже привязан</b>\n\n👤 ${userFio}\n📧 ${existingUser.email}\n\nВы уже получаете уведомления.`,
    );
    return;
  }

  await sendMessage(chatId, getStartInstruction());
}

/**
 * Обработка отправки номера телефона для привязки
 */
async function handlePhoneLink(chatId: number, phone: string) {
  console.log(`[Telegram Bot] Попытка привязки по телефону ${phone} для chatId ${chatId}`);

  // Ищем пользователя по телефону (нормализуем номер)
  const normalizedPhone = normalizePhone(phone);
  console.log(`[Telegram Bot] Нормализованный телефон: ${normalizedPhone}`);

  const user = await findUserByPhone(normalizedPhone);

  if (!user) {
    // Пользователь не найден
    await sendMessage(
      chatId,
      `❌ <b>Аккаунт не найден</b>\n\nПользователь с номером телефона ${phone} не найден в базе данных.\n\n📌 Проверьте правильность номера или напишите вашему менеджеру.`,
    );
    return;
  }

  // Проверяем, не привязан ли уже этот Telegram к другому пользователю
  const existingLink = await findUserByTelegramChatId(String(chatId));
  if (existingLink) {
    await sendMessage(
      chatId,
      `⚠️ <b>Telegram уже привязан</b>\n\nЭтот Telegram аккаунт уже привязан к:\n👤 ${existingLink.firstName} ${existingLink.lastName}`,
    );
    return;
  }

  // Привязываем Telegram к пользователю
  db.update(users)
    .set({ telegramChatId: String(chatId) })
    .where(eq(users.id, user.id))
    .run();

  console.log(`[Telegram Bot] Успешно привязан chatId ${chatId} к пользователю ${user.id}`);

  // Отправляем подтверждение
  const userFio = `${user.lastName} ${user.firstName} ${user.middleName || ""}`.trim();
  await sendMessage(
    chatId,
    `🎉 <b>Успешная привязка!</b>\n\n✅ Ваш Telegram аккаунт привязан к аккаунту:\n👤 ${userFio}\n📧 ${user.email}\n\nТеперь вы будете получать уведомления о новых доставках, водителях и статусах заказов.`,
  );
}

/**
 * Нормализация номера телефона
 */
function normalizePhone(phone: string): string {
  // Удаляем все кроме цифр
  const digits = phone.replace(/[^\d]/g, "");

  // Если начинается с 8 и длина 11 (8XXXXXXXXXX) -> заменяем на 7XXXXXXXXXX
  if (digits.startsWith("8") && digits.length === 11) {
    return "7" + digits.slice(1);
  }

  // Если начинается с 7 и длина 11 (7XXXXXXXXXX) -> оставляем как есть
  if (digits.startsWith("7") && digits.length === 11) {
    return digits;
  }

  // Если начинается с 7 и длина 10 (7XXXXXXXXX) -> добавляем цифру в конец (ожидаем 11)
  if (digits.startsWith("7") && digits.length === 10) {
    return "7" + digits;
  }

  // Если длина 10 и не начинается с 7 -> добавляем 7 в начало
  if (digits.length === 10) {
    return "7" + digits;
  }

  // По умолчанию: добавляем 7 в начало
  return "7" + digits;
}

/**
 * Поиск пользователя по телефону
 */
async function findUserByPhone(phone: string) {
  if (!phone) return null;

  return db.select().from(users).where(eq(users.phone, phone)).limit(1).get();
}

/**
 * Инструкция для пользователя
 */
export function getStartInstruction(): string {
  return `🔔 <b>Добро пожаловать в PolaNet!</b>

📌 <b>Чтобы привязать аккаунт, отправьте ваш номер телефона:</b>

Пример: <code>79123456789</code> или <code>+79123456789</code>

После привязки вы будете получать:
📦 Уведомления о новых доставках
🚗 Информация о водителях
📅 Даты и адреса

🔗 Ссылка для входа: https://admin-polanet.ru`;
}

/**
 * Поиск пользователя по telegram_chat_id
 */
async function findUserByTelegramChatId(chatId: string) {
  return db.select().from(users).where(eq(users.telegramChatId, chatId)).limit(1).get();
}

/**
 * Отправка сообщения через Telegram Bot API
 */
async function sendMessage(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("[Telegram Bot] TOKEN не настроен");
    return;
  }

  // Неблокирующая отправка - не ждём ответа
  const sendPromise = axios
    .post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔗 Открыть PolaNet",
                web_app: { url: "https://admin-polanet.ru" },
              },
            ],
          ],
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
        httpAgent: new http.Agent({ keepAlive: false }),
        httpsAgent: new https.Agent({ keepAlive: false }),
      },
    )
    .then(() => {
      console.log(`[Telegram Bot] Сообщение отправлено в чат ${chatId}`);
    })
    .catch((error) => {
      console.error(
        "[Telegram Bot] Ошибка отправки сообщения:",
        error instanceof Error ? error.message : String(error),
      );
    });

  // Не ждём завершения отправки
  sendPromise.catch(() => {});
}

/**
 * Установка webhook для Telegram
 */
export async function setupTelegramWebhook(webhookUrl: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn("[Telegram Bot] TELEGRAM_BOT_TOKEN не настроен. Webhook не будет установлен.");
    return;
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        url: webhookUrl,
        allowed_updates: ["message", "callback_query"],
      },
      {
        timeout: 30000,
      },
    );

    console.log(`[Telegram Bot] Webhook установлен: ${webhookUrl}`);
  } catch (error) {
    console.error("[Telegram Bot] Ошибка установки webhook:", error);
  }
}

/**
 * Удаление webhook (для локальной разработки с ngrok и т.п.)
 */
export async function removeTelegramWebhook() {
  if (!TELEGRAM_BOT_TOKEN) {
    return;
  }

  try {
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`,
      {},
      {
        timeout: 10000,
      },
    );

    console.log("[Telegram Bot] Webhook удалён");
  } catch (error) {
    console.error("[Telegram Bot] Ошибка удаления webhook:", error);
  }
}

/**
 * Проверка статуса webhook
 */
export async function getTelegramWebhookInfo() {
  if (!TELEGRAM_BOT_TOKEN) {
    return null;
  }

  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`,
      {
        timeout: 30000,
      },
    );
    return response.data;
  } catch (error) {
    console.error("[Telegram Bot] Ошибка получения информации о webhook:", error);
    return null;
  }
}

/**
 * Получение списка всех пользователей с привязанным Telegram
 */
export async function getUsersWithTelegram() {
  return db
    .select({
      id: users.id,
      lastName: users.lastName,
      firstName: users.firstName,
      middleName: users.middleName,
      email: users.email,
      phone: users.phone,
      telegramChatId: users.telegramChatId,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(isNotNull(users.telegramChatId))
    .all();
}
