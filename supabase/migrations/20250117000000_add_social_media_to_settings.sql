-- Add social media fields to settings table
ALTER TABLE settings 
ADD COLUMN instagram_url VARCHAR(255) NULL,
ADD COLUMN tiktok_url VARCHAR(255) NULL,
ADD COLUMN facebook_url VARCHAR(255) NULL;

-- Add default comment
COMMENT ON COLUMN settings.instagram_url IS 'Instagram profile URL';
COMMENT ON COLUMN settings.tiktok_url IS 'TikTok profile URL';
COMMENT ON COLUMN settings.facebook_url IS 'Facebook profile URL';

