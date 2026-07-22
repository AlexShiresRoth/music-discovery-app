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
import { SocialField, SongClipWithSlot } from "./types";

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
  location: jsonb("location")
    .$type<{
      formattedLocation: string;
      lat: number;
      lon: number;
    }>()
    .notNull()
    .default({ formattedLocation: "", lat: 0, lon: 0 }),
  website: jsonb("website")
    .$type<SocialField>()
    .notNull()
    .default({ url: "", show: true }),
  facebook: jsonb("facebook")
    .$type<SocialField>()
    .notNull()
    .default({ url: "", show: true }),
  instagram: jsonb("instagram")
    .$type<SocialField>()
    .notNull()
    .default({ url: "", show: true }),
  tiktok: jsonb("tiktok")
    .$type<SocialField>()
    .notNull()
    .default({ url: "", show: true }),
  spotify: jsonb("spotify")
    .$type<SocialField>()
    .notNull()
    .default({ url: "", show: true }),
  appleMusic: jsonb("apple_music")
    .$type<SocialField>()
    .notNull()
    .default({ url: "", show: true }),
  soundcloud: jsonb("soundcloud")
    .$type<SocialField>()
    .notNull()
    .default({ url: "", show: true }),
  bandcamp: jsonb("bandcamp")
    .$type<SocialField>()
    .notNull()
    .default({ url: "", show: true }),
  userRefId: uuid("user_ref_id").notNull(),
});
