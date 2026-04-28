import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../../data/polanet.db");
const sqlite = new Database(dbPath);

async function addOrderPhoneColumns() {
  console.log("Adding phone columns to orders table...");

  try {
    // Add payer_phone column
    sqlite.exec(`ALTER TABLE orders ADD COLUMN payer_phone TEXT;`);
    console.log("✓ Added payer_phone column");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("✓ payer_phone column already exists");
    } else {
      console.error("Error adding payer_phone column:", error);
      throw error;
    }
  }

  try {
    // Add receiver_phone column
    sqlite.exec(`ALTER TABLE orders ADD COLUMN receiver_phone TEXT;`);
    console.log("✓ Added receiver_phone column");
  } catch (error: any) {
    if (error.message.includes("already exists")) {
      console.log("✓ receiver_phone column already exists");
    } else {
      console.error("Error adding receiver_phone column:", error);
      throw error;
    }
  }

  console.log("Migration completed successfully!");
  sqlite.close();
}

addOrderPhoneColumns().catch(console.error);
