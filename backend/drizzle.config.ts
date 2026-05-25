import type { Config } from "drizzle-kit";

const dbUrl = process.env.DATABASE_PATH || "./data/polanet.db";

export default {
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbUrl,
  },
} satisfies Config;
