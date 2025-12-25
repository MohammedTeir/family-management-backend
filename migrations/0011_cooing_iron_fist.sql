ALTER TABLE "families" ADD COLUMN "priority" integer DEFAULT 5;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "branch" varchar(100);--> statement-breakpoint
CREATE INDEX "users_branch_idx" ON "users" USING btree ("branch");