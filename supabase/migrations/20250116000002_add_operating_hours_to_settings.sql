-- Add operating_hours column to settings table if it doesn't exist
ALTER TABLE settings ADD COLUMN IF NOT EXISTS operating_hours VARCHAR(255) DEFAULT 'Setiap Hari: 07.00 - 21.00 WIT';

