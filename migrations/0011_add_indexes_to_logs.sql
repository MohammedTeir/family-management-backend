CREATE INDEX "logs_type_idx" ON "logs" ("type");--> statement-breakpoint
CREATE INDEX "logs_user_id_idx" ON "logs" ("user_id");--> statement-breakpoint
CREATE INDEX "logs_created_at_idx" ON "logs" ("created_at");--> statement-breakpoint
CREATE INDEX "logs_type_user_id_created_at_idx" ON "logs" ("type", "user_id", "created_at");