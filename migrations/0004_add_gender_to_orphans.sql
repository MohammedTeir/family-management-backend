-- Migration: Add gender field to orphans table
ALTER TABLE "orphans" ADD COLUMN "gender" varchar(10) DEFAULT 'male';