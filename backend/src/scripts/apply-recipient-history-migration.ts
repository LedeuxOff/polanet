import { db } from "../db/index.js";

async function applyRecipientHistoryMigration() {
  console.log("Applying recipient_history table migration...");

  try {
    // Create recipient_history table
    await db.run(`
      CREATE TABLE IF NOT EXISTS recipient_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        delivery_id INTEGER NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
        income_id INTEGER REFERENCES incomes(id) ON DELETE SET NULL,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
        recipient_type TEXT CHECK(recipient_type IN ('employee', 'driver')),
        recipient_id INTEGER,
        old_recipient_type TEXT CHECK(old_recipient_type IN ('employee', 'driver')),
        old_recipient_id INTEGER,
        action TEXT NOT NULL,
        comment TEXT,
        created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
      )
    `);
    console.log("✓ Created recipient_history table");

    // Create indexes
    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_recipient_history_delivery_id ON recipient_history(delivery_id)",
    );
    console.log("✓ Created index on delivery_id");

    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_recipient_history_income_id ON recipient_history(income_id)",
    );
    console.log("✓ Created index on income_id");

    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_recipient_history_user_id ON recipient_history(user_id)",
    );
    console.log("✓ Created index on user_id");

    await db.run(
      "CREATE INDEX IF NOT EXISTS idx_recipient_history_created_at ON recipient_history(created_at)",
    );
    console.log("✓ Created index on created_at");

    console.log("Migration completed successfully!");
  } catch (error: any) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

applyRecipientHistoryMigration();
