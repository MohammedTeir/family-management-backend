-- Migration number: 0009

-- Add new fields to orphans table

ALTER TABLE orphans ADD COLUMN has_chronic_illness BOOLEAN DEFAULT FALSE;
ALTER TABLE orphans ADD COLUMN chronic_illness_type TEXT;
ALTER TABLE orphans ADD COLUMN is_disabled BOOLEAN DEFAULT FALSE;
ALTER TABLE orphans ADD COLUMN disability_type TEXT;
ALTER TABLE orphans ADD COLUMN has_war_injury BOOLEAN DEFAULT FALSE;
ALTER TABLE orphans ADD COLUMN war_injury_type TEXT;