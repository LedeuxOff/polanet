import axios from "axios";
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
    const chatId = message.chat.id.toString();
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

    // Если пользователь уже начал диалог, пытаемся найти его по telegram_chat_id
    const user = await findUserByTelegramChatId(chatId);

    if (!user) {
      // Пользователь не найден - отправляем инструкцию
      await sendMessage(chatId, getStartInstruction());
      return { ok: true };
    }

    // Пользователь найден - отправляем подтверждение
    const userFio = `${user.lastName} ${user.firstName}`;
    await sendMessage(
      chatId,
      `✅ <b>Telegram привязан к аккаунту</b>\n\n👤 ${userFio}\n📧 ${user.email}\n\nТеперь вы будете получать уведомления о доставках.`,
    );

    return { ok: true };
  } catch (error) {
    console.error("[Telegram Bot] Ошибка обработки:", error);
    return { ok: true }; // Telegram требует отвечать даже при ошибках
  }
}

/**
 * Обработка команды /start
 */
async function handleStartCommand(chatId: string) {
  // Проверяем, привязан ли уже этот chatId
  const existingUser = await findUserByTelegramChatId(chatId);

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
 * Инструкция для пользователя
 */
function getStartInstruction(): string {
  return `🔔 <b>Добро пожаловать в PolaNet!</b>

Я бот для получения уведомлений о доставках.

📌 <b>Чтобы получать уведомления:</b>

1. Нажмите кнопку ниже
2. Войдите в свой аккаунт
3. Или напишите вашему менеджеру для привязки

После привязки вы будете получать:
📦 Уведомления о новых доставках
🚗 Информация о водителях
📅 Даты и адреса

<button onclick="tg.openLink('https://polanet.ru/login')">🔐 Войти в аккаунт</button>`;
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
async function sendMessage(chatId: string, text: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("[Telegram Bot] TOKEN не настроен");
    return;
  }

  try {
    await axios.post(
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
                web_app: { url: "https://polanet.ru" },
              },
            ],
          ],
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
      },
    );
    console.log(`[Telegram Bot] Сообщение отправлено в чат ${chatId}`);
  } catch (error) {
    console.error("[Telegram Bot] Ошибка отправки сообщения:", error);
  }
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
        timeout: 10000,
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
        timeout: 10000,
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
