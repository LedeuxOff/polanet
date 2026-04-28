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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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

// Запуск автоматического резервного копирования
startAutoBackup();

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📍 API доступно на http://localhost:${PORT}/api`);
  console.log(`📱 SMS_API_ID настроен: ${!!process.env.SMS_API_ID}`);
});
