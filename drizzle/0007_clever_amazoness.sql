CREATE SCHEMA IF NOT EXISTS "gis";--> statement-breakpoint
DO $$
BEGIN
	-- Prefer Supabase-style gis schema; fall back if postgis already lives elsewhere
	IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'postgis') THEN
		CREATE EXTENSION "postgis" WITH SCHEMA "gis";
	END IF;
END $$;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "location";--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "city" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "country" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "country_code" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "state" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "state_code" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "formatted_location" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "lat" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "lon" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'profiles'
			AND column_name = 'location'
	) THEN
		IF EXISTS (
			SELECT 1
			FROM pg_type t
			JOIN pg_namespace n ON n.oid = t.typnamespace
			WHERE t.typname = 'geography' AND n.nspname = 'gis'
		) THEN
			EXECUTE 'ALTER TABLE "profiles" ADD COLUMN "location" "gis"."geography"(Point, 4326)';
		ELSIF EXISTS (
			SELECT 1
			FROM pg_type t
			JOIN pg_namespace n ON n.oid = t.typnamespace
			WHERE t.typname = 'geography' AND n.nspname = 'extensions'
		) THEN
			EXECUTE 'ALTER TABLE "profiles" ADD COLUMN "location" "extensions"."geography"(Point, 4326)';
		ELSE
			EXECUTE 'ALTER TABLE "profiles" ADD COLUMN "location" geography(Point, 4326)';
		END IF;
	END IF;
END $$;
