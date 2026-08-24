-- Migration: Add transportCardId to users table
-- This allows employees to be linked to transport cards via users.transportCardId
-- instead of transport_cards.employeeId

-- Add transport_card_id column to users table
ALTER TABLE users ADD COLUMN transport_card_id INTEGER REFERENCES transport_cards(id) ON DELETE SET NULL;
