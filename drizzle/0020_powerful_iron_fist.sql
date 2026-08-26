CREATE TABLE "verification_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_ref_id" uuid NOT NULL,
	"profile_ref_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"status" "feedback_status" DEFAULT 'open' NOT NULL
);
