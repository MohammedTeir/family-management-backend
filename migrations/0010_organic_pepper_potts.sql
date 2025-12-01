ALTER TABLE "notifications" ADD COLUMN "read" boolean DEFAULT false;--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read");