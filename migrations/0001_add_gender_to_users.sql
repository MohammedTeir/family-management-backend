-- Migration: Add gender field to users table
ALTER TABLE "users" ADD COLUMN "gender" varchar(10) DEFAULT 'male';