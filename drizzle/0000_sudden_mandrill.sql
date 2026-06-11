CREATE TABLE "artist_profile" (
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
	"artistcamp" text,
	"soundcloud" text,
	"artist_name" text,
	"artist_description" text,
	"artist_logo" text,
	"genre" text,
	"members" text[] NOT NULL,
	"joined_date" timestamp DEFAULT now(),
	"song_clips" text[] NOT NULL,
	"members_with_access" uuid[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listener_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text,
	"genres" text[] NOT NULL,
	"location" text,
	"joined_date" timestamp DEFAULT now(),
	"liked_artists" text[] NOT NULL
);
--> statement-breakpoint
CREATE TABLE "song_clips" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"db_url" text,
	"full_song_url" text
);
