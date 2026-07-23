ALTER TABLE "profiles" ALTER COLUMN "city" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "country" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "country_code" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "state" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "state_code" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "formatted_location" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "lat" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "profiles" ALTER COLUMN "lon" SET DATA TYPE double precision;