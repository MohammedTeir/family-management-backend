ALTER TABLE "orphans" ADD COLUMN "has_chronic_illness" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orphans" ADD COLUMN "chronic_illness_type" text;--> statement-breakpoint
ALTER TABLE "orphans" ADD COLUMN "is_disabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orphans" ADD COLUMN "disability_type" text;--> statement-breakpoint
ALTER TABLE "orphans" ADD COLUMN "has_war_injury" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "orphans" ADD COLUMN "war_injury_type" text;