import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.js";
export { schema };

const sqlite = new Database("data/polanet.db");
export const db = drizzle(sqlite, { schema });
