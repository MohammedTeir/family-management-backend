ALTER TABLE "families" ADD COLUMN "has_war_injury" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "families" ADD COLUMN "war_injury_type" text;--> statement-breakpoint
ALTER TABLE "families" ADD COLUMN "wife_has_war_injury" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "families" ADD COLUMN "wife_war_injury_type" text;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "has_war_injury" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "war_injury_type" text;