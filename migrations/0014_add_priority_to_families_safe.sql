-- Migration: Add priority column to families table (if not exists)

-- Add the priority column with default value of 5 (normal priority) if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='families' AND column_name='priority') THEN
        ALTER TABLE families ADD COLUMN priority INTEGER DEFAULT 5;
        COMMENT ON COLUMN families.priority IS 'Priority level for the family (1-5, where 5 is normal)';
    END IF;
END $$;