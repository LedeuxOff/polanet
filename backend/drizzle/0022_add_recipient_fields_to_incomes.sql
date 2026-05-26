-- Migration: Add recipient fields to incomes table
-- Date: 2026-05-26
-- Description: Add recipient_type and recipient_id columns to incomes table
-- for tracking who receives the payment for deliveries

ALTER TABLE incomes ADD COLUMN recipient_type TEXT CHECK(recipient_type IN ('employee', 'driver'));
ALTER TABLE incomes ADD COLUMN recipient_id INTEGER;
