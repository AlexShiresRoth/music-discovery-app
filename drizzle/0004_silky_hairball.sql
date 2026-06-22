ALTER TABLE "listener_profile" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "listener_profile" ADD COLUMN "country" text;--> statement-breakpoint
ALTER TABLE "listener_profile" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "listener_profile" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "listener_profile" DROP COLUMN "location";