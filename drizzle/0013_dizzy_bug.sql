-- 0012 added profile_ref_id as uuid; schema wants integer FK → profiles.id.
-- uuid→integer is not castable, so drop and recreate, then backfill from profiles.song_clips.
ALTER TABLE "song_clips" DROP COLUMN IF EXISTS "profile_ref_id";--> statement-breakpoint
ALTER TABLE "song_clips" ADD COLUMN "profile_ref_id" integer;--> statement-breakpoint
UPDATE "song_clips" AS sc
SET "profile_ref_id" = p.id
FROM "profiles" AS p,
	LATERAL jsonb_array_elements(p."song_clips") AS elem
WHERE (elem->>'id')::integer = sc.id;--> statement-breakpoint
-- Orphan clips (not referenced by any profile) can't satisfy NOT NULL + FK
DELETE FROM "song_clips" WHERE "profile_ref_id" IS NULL;--> statement-breakpoint
ALTER TABLE "song_clips" ALTER COLUMN "profile_ref_id" SET NOT NULL;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'song_clips_profile_ref_id_profiles_id_fk'
	) THEN
		ALTER TABLE "song_clips"
			ADD CONSTRAINT "song_clips_profile_ref_id_profiles_id_fk"
			FOREIGN KEY ("profile_ref_id") REFERENCES "public"."profiles"("id")
			ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
