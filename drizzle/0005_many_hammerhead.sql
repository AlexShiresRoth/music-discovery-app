ALTER TABLE "profiles" ADD COLUMN "location" jsonb DEFAULT '{"city":"","state":"","country":"","lat":0,"lng":0}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "country";