import { db } from "../db/index.js";

async function applyRecipientMigration() {
  console.log("Applying recipient fields migration to incomes table...");

  try {
    // Add recipient_type column
    await db.run(
      "ALTER TABLE incomes ADD COLUMN recipient_type TEXT CHECK(recipient_type IN ('employee', 'driver'))",
    );
    console.log("✓ Added recipient_type column");

    // Add recipient_id column
    await db.run("ALTER TABLE incomes ADD COLUMN recipient_id INTEGER");
    console.log("✓ Added recipient_id column");

    console.log("Migration completed successfully!");
  } catch (error: any) {
    if (error.message.includes("duplicate column name")) {
      console.log("Columns already exist, skipping migration.");
    } else {
      console.error("Migration failed:", error.message);
      process.exit(1);
    }
  }
}

applyRecipientMigration();
