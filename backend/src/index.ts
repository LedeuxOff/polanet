import "dotenv/config";
import express from "express";
import cors from "cors";

// Импорт роутов
import authRoutes from "./routes/auth.js";

// Импорт авто-бэкапа
import { startAutoBackup } from "./db/auto-backup.js";
import userRoutes from "./routes/users.js";
import roleRoutes from "./routes/roles.js";
import carRoutes from "./routes/cars.js";
import driverRoutes from "./routes/drivers.js";
import clientRoutes from "./routes/clients.js";
import orderRoutes from "./routes/orders.js";
import transportCardRoutes from "./routes/transportCards.js";
import deliveryRoutes from "./routes/deliveries.js";
import incomeRoutes from "./routes/incomes.js";
import expenseRoutes from "./routes/expenses.js";
import backupRoutes from "./routes/backups.js";
import systemInfoRoutes from "./routes/systemInfo.js";
import systemLogsRoutes from "./routes/systemLogs.js";
import permissionsRoutes from "./routes/permissions.js";
import telegramRoutes from "./routes/telegram.js";

// Импорт обработчика ошибок
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";
const corsOrigin = process.env.CORS_ORIGIN || "*";

// CORS configuration
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-App-Version"],
  }),
);

app.use(express.json());

// Serve built frontend in production
if (isProduction) {
  const path = await import("path");
  const fs = await import("fs");
  const url = await import("url");
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
  const frontendDist = path.join(__dirname, "../frontend/dist");

  // Only serve frontend if it exists
  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    // Serve index.html for all other routes (SPA fallback)
    app.get("*", (_req, res) => {
      res.sendFile(path.join(frontendDist, "index.html"));
    });
  }
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API роуты
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/transport-cards", transportCardRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/backups", backupRoutes);
app.use("/api/system-info", systemInfoRoutes);
app.use("/api/system-logs", systemLogsRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/telegram", telegramRoutes);

// Telegram webhook endpoint (должен быть перед другими маршрутами)
app.post("/api/telegram/webhook", async (req, res) => {
  try {
    const { handleTelegramWebhook } = await import("./services/telegram-bot.js");
    const result = await handleTelegramWebhook(req.body);
    res.json(result);
  } catch (error) {
    console.error("[Telegram Webhook] Ошибка:", error);
    res.status(500).json({ error: "Ошибка обработки webhook" });
  }
});

// Глобальный обработчик ошибок (4-argument middleware)
app.use(errorHandler);

// Запуск автоматического резервного копирования
startAutoBackup();

// Настройка Telegram webhook
async function setupTelegram() {
  const { setupTelegramWebhook } = await import("./services/telegram-bot.js");
  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

  if (webhookUrl) {
    await setupTelegramWebhook(webhookUrl);
  } else {
    console.log(
      "⚠️  TELEGRAM_WEBHOOK_URL не настроен. Для работы бота настройте webhook или используйте ngrok для локальной разработки.",
    );
  }
}

setupTelegram();

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📍 API доступно на http://localhost:${PORT}/api`);
});
