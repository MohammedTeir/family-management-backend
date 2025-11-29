-- Migration: Add image field to orphans table

-- Add image column to orphans table
ALTER TABLE orphans ADD COLUMN image TEXT;

-- Update the orphans table comment to document the new field
COMMENT ON COLUMN orphans.image IS 'Base64 encoded image data for orphan photos';