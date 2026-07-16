ALTER TABLE "profiles" ALTER COLUMN "song_clips" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "song_clips" SET DATA TYPE jsonb USING COALESCE(to_jsonb("song_clips"), '[]'::jsonb);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "song_clips" SET DEFAULT '[]'::jsonb;
