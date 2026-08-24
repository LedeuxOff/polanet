import { Router } from "express";
import { db } from "../db/index.js";
import { cars } from "../db/schema.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissions.js";
import { createCarSchema, updateCarSchema } from "../middleware/validators.js";
import { eq } from "drizzle-orm";

const router = Router();

// Получить все автомобили с пагинацией и поиском
router.get("/", authenticate, requirePermission("cars:list"), (req: AuthRequest, res) => {
  try {
    // Парсинг параметров пагинации
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const offset = (page - 1) * limit;

    // Парсинг параметров поиска
    const searchBrand = req.query.brand as string;
    const searchLicensePlate = req.query.licensePlate as string;

    // Получаем все автомобили
    let allCars = db.select().from(cars).all();

    if (searchBrand || searchLicensePlate) {
      allCars = allCars.filter((car) => {
        const matchesBrand = searchBrand
          ? car.brand?.toLowerCase().includes(searchBrand.toLowerCase())
          : true;
        const matchesLicensePlate = searchLicensePlate
          ? car.licensePlate?.toLowerCase().includes(searchLicensePlate.toLowerCase())
          : true;
        return matchesBrand && matchesLicensePlate;
      });
    }

    // Пагинация
    const totalRecords = allCars.length;
    const totalPages = Math.ceil(totalRecords / limit);
    const paginatedCars = allCars.slice(offset, offset + limit);

    res.json({
      data: paginatedCars,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error getting cars:", error);
    res
      .status(500)
      .json({ error: "Ошибка сервера", details: error instanceof Error ? error.message : error });
  }
});

// Получить автомобиль по ID
router.get("/:id", authenticate, requirePermission("cars:detail"), (req: AuthRequest, res) => {
  try {
    const car = db
      .select()
      .from(cars)
      .where(eq(cars.id, Number(req.params.id)))
      .get();

    if (!car) {
      return res.status(404).json({ error: "Автомобиль не найден" });
    }

    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Создать автомобиль
router.post("/", authenticate, requirePermission("cars:create"), (req: AuthRequest, res) => {
  try {
    const data = createCarSchema.parse(req.body);

    const existingCar = db
      .select()
      .from(cars)
      .where(eq(cars.licensePlate, data.licensePlate))
      .get();

    if (existingCar) {
      return res.status(409).json({ error: "Автомобиль с таким номером уже существует" });
    }

    const result = db.insert(cars).values(data).run();

    const newCar = db
      .select()
      .from(cars)
      .where(eq(cars.id, Number(result.lastInsertRowid)))
      .get();

    res.status(201).json(newCar);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Ошибка валидации", details: error });
    }
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Обновить автомобиль
router.put("/:id", authenticate, requirePermission("cars:update"), (req: AuthRequest, res) => {
  try {
    const data = updateCarSchema.parse(req.body);
    const carId = Number(req.params.id);

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date().toISOString(),
    };

    db.update(cars).set(updateData).where(eq(cars.id, carId)).run();

    const updatedCar = db.select().from(cars).where(eq(cars.id, carId)).get();

    res.json(updatedCar);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return res.status(400).json({ error: "Ошибка валидации", details: error });
    }
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Удалить автомобиль
router.delete("/:id", authenticate, requirePermission("cars:delete"), (req: AuthRequest, res) => {
  try {
    const carId = Number(req.params.id);

    db.delete(cars).where(eq(cars.id, carId)).run();

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
