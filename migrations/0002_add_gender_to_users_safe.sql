-- Migration: Add gender field to users table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'gender') THEN
        ALTER TABLE "users" ADD COLUMN "gender" varchar(10) DEFAULT 'male';
    END IF;
END $$;