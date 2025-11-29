CREATE TABLE "import_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" varchar(255) NOT NULL,
	"user_id" integer NOT NULL,
	"total_records" integer NOT NULL,
	"valid_records" integer NOT NULL,
	"invalid_records" integer NOT NULL,
	"uploaded_at" timestamp DEFAULT now(),
	"original_filename" varchar(500),
	"processed" integer DEFAULT 0,
	"status" varchar(50) DEFAULT 'initialized',
	"transformed_data" text,
	"invalid_rows" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "import_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "import_sessions" ADD CONSTRAINT "import_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "import_sessions_session_id_idx" ON "import_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "import_sessions_user_id_idx" ON "import_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "import_sessions_status_idx" ON "import_sessions" USING btree ("status");