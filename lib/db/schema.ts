import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { SongClipWithSlot } from "./types";

export const songClipsSchema = pgTable("song_clips", {
  id: serial("id").primaryKey(),
  slot: integer("slot").notNull(),
  title: text("title"),
  db_url: text("db_url"),
  full_song_url: text("full_song_url"),
});

export const profilesSchema = pgTable("profiles", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  contactEmail: text("contact_email"),
  profileName: text("profile_name"),
  bio: text("bio"),
  genre: text("genre"),
  joinedDate: timestamp("joined_date").defaultNow(),
  isVerified: boolean("is_verified").default(false),
  songClips: jsonb("song_clips")
    .$type<SongClipWithSlot[]>()
    .notNull()
    .default([]),
  imageUrl: text("image_url"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  website: text("website"),
  facebook: text("facebook"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  spotify: text("spotify"),
  appleMusic: text("apple_music"),
  soundcloud: text("soundcloud"),
  userRefId: uuid("user_ref_id").notNull(),
});
