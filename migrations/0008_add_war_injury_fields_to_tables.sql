-- Migration to add war injury fields to families and members tables
ALTER TABLE "families" ADD COLUMN "has_war_injury" BOOLEAN DEFAULT FALSE;
ALTER TABLE "families" ADD COLUMN "war_injury_type" TEXT;
ALTER TABLE "families" ADD COLUMN "wife_has_war_injury" BOOLEAN DEFAULT FALSE;
ALTER TABLE "families" ADD COLUMN "wife_war_injury_type" TEXT;
ALTER TABLE "members" ADD COLUMN "has_war_injury" BOOLEAN DEFAULT FALSE;
ALTER TABLE "members" ADD COLUMN "war_injury_type" TEXT;