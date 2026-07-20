ALTER TABLE "profiles" ALTER COLUMN "website" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "website" SET DATA TYPE jsonb USING (
	CASE
		WHEN "website" IS NULL OR btrim("website") = '' THEN '{"url":"","show":true}'::jsonb
		ELSE jsonb_build_object('url', "website", 'show', true)
	END
);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "website" SET DEFAULT '{"url":"","show":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "website" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "facebook" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "facebook" SET DATA TYPE jsonb USING (
	CASE
		WHEN "facebook" IS NULL OR btrim("facebook") = '' THEN '{"url":"","show":true}'::jsonb
		ELSE jsonb_build_object('url', "facebook", 'show', true)
	END
);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "facebook" SET DEFAULT '{"url":"","show":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "facebook" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "instagram" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "instagram" SET DATA TYPE jsonb USING (
	CASE
		WHEN "instagram" IS NULL OR btrim("instagram") = '' THEN '{"url":"","show":true}'::jsonb
		ELSE jsonb_build_object('url', "instagram", 'show', true)
	END
);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "instagram" SET DEFAULT '{"url":"","show":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "instagram" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "tiktok" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "tiktok" SET DATA TYPE jsonb USING (
	CASE
		WHEN "tiktok" IS NULL OR btrim("tiktok") = '' THEN '{"url":"","show":true}'::jsonb
		ELSE jsonb_build_object('url', "tiktok", 'show', true)
	END
);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "tiktok" SET DEFAULT '{"url":"","show":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "tiktok" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "spotify" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "spotify" SET DATA TYPE jsonb USING (
	CASE
		WHEN "spotify" IS NULL OR btrim("spotify") = '' THEN '{"url":"","show":true}'::jsonb
		ELSE jsonb_build_object('url', "spotify", 'show', true)
	END
);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "spotify" SET DEFAULT '{"url":"","show":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "spotify" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "apple_music" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "apple_music" SET DATA TYPE jsonb USING (
	CASE
		WHEN "apple_music" IS NULL OR btrim("apple_music") = '' THEN '{"url":"","show":true}'::jsonb
		ELSE jsonb_build_object('url', "apple_music", 'show', true)
	END
);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "apple_music" SET DEFAULT '{"url":"","show":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "apple_music" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "soundcloud" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "soundcloud" SET DATA TYPE jsonb USING (
	CASE
		WHEN "soundcloud" IS NULL OR btrim("soundcloud") = '' THEN '{"url":"","show":true}'::jsonb
		ELSE jsonb_build_object('url', "soundcloud", 'show', true)
	END
);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "soundcloud" SET DEFAULT '{"url":"","show":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "soundcloud" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "bandcamp" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "bandcamp" SET DATA TYPE jsonb USING (
	CASE
		WHEN "bandcamp" IS NULL OR btrim("bandcamp") = '' THEN '{"url":"","show":true}'::jsonb
		ELSE jsonb_build_object('url', "bandcamp", 'show', true)
	END
);--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "bandcamp" SET DEFAULT '{"url":"","show":true}'::jsonb;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "bandcamp" SET NOT NULL;
