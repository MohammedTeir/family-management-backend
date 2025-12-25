-- Migration: Add priority column to families table

-- Add the priority column with default value of 5 (normal priority)
ALTER TABLE families ADD COLUMN priority INTEGER DEFAULT 5;

-- Add comment to document the column
COMMENT ON COLUMN families.priority IS 'Priority level for the family (1-5, where 5 is normal)';