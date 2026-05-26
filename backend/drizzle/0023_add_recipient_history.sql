-- Create recipient_history table to track recipient changes
CREATE TABLE IF NOT EXISTS recipient_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    delivery_id INTEGER NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    income_id INTEGER REFERENCES incomes(id) ON DELETE SET NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    recipient_type TEXT CHECK(recipient_type IN ('employee', 'driver')),
    recipient_id INTEGER,
    old_recipient_type TEXT CHECK(old_recipient_type IN ('employee', 'driver')),
    old_recipient_id INTEGER,
    action TEXT NOT NULL, -- 'created', 'updated', 'deleted'
    comment TEXT,
    created_at TEXT NOT NULL DEFAULT (CURRENT_TIMESTAMP)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_recipient_history_delivery_id ON recipient_history(delivery_id);
CREATE INDEX IF NOT EXISTS idx_recipient_history_income_id ON recipient_history(income_id);
CREATE INDEX IF NOT EXISTS idx_recipient_history_user_id ON recipient_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recipient_history_created_at ON recipient_history(created_at);
