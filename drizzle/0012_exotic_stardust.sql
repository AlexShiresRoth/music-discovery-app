ALTER TABLE "song_clips" ADD COLUMN "profile_ref_id" uuid;--> statement-breakpoint
ALTER TABLE "song_clips" ADD COLUMN "created_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "song_clips" ADD COLUMN "updated_at" timestamp DEFAULT now();