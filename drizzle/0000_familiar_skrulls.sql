CREATE TABLE "profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"contact_email" text,
	"profile_name" text,
	"bio" text,
	"genre" text,
	"joined_date" timestamp DEFAULT now(),
	"is_verified" boolean DEFAULT false,
	"song_clips" jsonb[] DEFAULT '{}' NOT NULL,
	"image_url" text,
	"city" text,
	"state" text,
	"country" text,
	"website" text,
	"facebook" text,
	"instagram" text,
	"tiktok" text,
	"spotify" text,
	"apple_music" text,
	"soundcloud" text,
	"user_ref_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song_clips" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot" integer NOT NULL,
	"title" text,
	"db_url" text,
	"full_song_url" text
);
