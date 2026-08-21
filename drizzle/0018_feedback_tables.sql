CREATE TYPE "public"."feedback_status" AS ENUM('open', 'in_progress', 'resolved', 'closed');--> statement-breakpoint
CREATE TABLE "bug_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"status" "feedback_status" DEFAULT 'open' NOT NULL,
	"user_ref_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"message" text NOT NULL,
	"status" "feedback_status" DEFAULT 'open' NOT NULL,
	"user_ref_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
