CREATE TABLE "account_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_ref_id" uuid,
	"profile_ref_id" integer NOT NULL,
	"report_reason" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"status" "feedback_status" DEFAULT 'open' NOT NULL
);
