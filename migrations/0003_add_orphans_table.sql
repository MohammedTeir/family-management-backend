-- Migration: Add orphans table
CREATE TABLE "orphans" (
    "id" serial PRIMARY KEY,
    "family_id" integer NOT NULL REFERENCES "families"("id") ON DELETE CASCADE,
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
    "created_at" timestamp DEFAULT NOW()
);

CREATE INDEX "orphans_family_id_idx" ON "orphans" ("family_id");
CREATE INDEX "orphans_orphan_id_idx" ON "orphans" ("orphan_id");
CREATE INDEX "orphans_guardian_id_idx" ON "orphans" ("guardian_id");
CREATE INDEX "orphans_created_at_idx" ON "orphans" ("created_at");