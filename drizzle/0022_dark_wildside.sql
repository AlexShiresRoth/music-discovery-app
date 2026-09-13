ALTER TABLE "profiles" ADD COLUMN "open_to_collaboration" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "open_to_gigs" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "status_message" text;