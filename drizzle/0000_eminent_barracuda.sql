CREATE TABLE "band_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text,
	"contact_email" text,
	"city" text,
	"state" text,
	"country" text,
	"website" text,
	"facebook" text,
	"instagram" text,
	"tiktok" text,
	"spotify" text,
	"apple_music" text,
	"bandcamp" text,
	"soundcloud" text,
	"band_name" text,
	"band_description" text,
	"band_logo" text,
	"genre" text,
	"members" text[] NOT NULL,
	"joined_date" timestamp DEFAULT now(),
	"song_clips" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song_clips" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"db_url" text,
	"full_song_url" text
);
