ALTER TABLE transport_cards ADD COLUMN status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive'));
