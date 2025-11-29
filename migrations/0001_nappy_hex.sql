CREATE TABLE "orphans" (
	"id" serial PRIMARY KEY NOT NULL,
	"family_id" integer NOT NULL,
	"orphan_name" text NOT NULL,
	"orphan_birth_date" varchar(10),
	"orphan_id" varchar(20),
	"guardian_name" text NOT NULL,
	"guardian_id" varchar(20),
	"guardian_birth_date" varchar(10),
	"father_name" text,
	"father_id" varchar(20),
	"martyrdom_date" varchar(10),
	"bank_account_number" text,
	"account_holder_name" text,
	"current_address" text,
	"original_address" text,
	"mobile_number" varchar(20),
	"backup_mobile_number" varchar(20),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orphans" ADD CONSTRAINT "orphans_family_id_families_id_fk" FOREIGN KEY ("family_id") REFERENCES "public"."families"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "orphans_family_id_idx" ON "orphans" USING btree ("family_id");--> statement-breakpoint
CREATE INDEX "orphans_orphan_id_idx" ON "orphans" USING btree ("orphan_id");--> statement-breakpoint
CREATE INDEX "orphans_guardian_id_idx" ON "orphans" USING btree ("guardian_id");--> statement-breakpoint
CREATE INDEX "orphans_created_at_idx" ON "orphans" USING btree ("created_at");