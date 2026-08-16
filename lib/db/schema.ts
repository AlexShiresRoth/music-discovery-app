import {
  boolean,
  customType,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { SocialField, SongClipWithSlot } from "./types";

/** PostGIS geography point in the Supabase `gis` schema (SRID 4326). */
export const geographyPoint = customType<{ data: string | null }>({
  dataType() {
    return "gis.geography(Point, 4326)";
  },
});

export const songClipsSchema = pgTable("song_clips", {
  id: serial("id").primaryKey(),
  slot: integer("slot").notNull(),
  title: text("title"),
  db_url: text("db_url"),
  full_song_url: text("full_song_url"),
  genre: text("genre"),
  profileRefId: integer("profile_ref_id")
    .notNull()
    .references(() => profilesSchema.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profilesSchema = pgTable("profiles", {
  id: serial("id").primaryKey(),
  public: boolean("public").default(true),
  fullName: text("full_name"),
  contactEmail: text("contact_email"),
  profileName: text("profile_name"),
  bio: text("bio"),
  genre: text("genre"), // @deprecated - use songClips.genre instead
  influences: jsonb("influences").$type<string[]>().notNull().default([]),
  joinedDate: timestamp("joined_date").defaultNow(),
  isVerified: boolean("is_verified").default(false),
  songClips: jsonb("song_clips")
    .$type<SongClipWithSlot[]>()
    .notNull()
    .default([]),
  imageUrl: text("image_url"),
  city: text("city").notNull().default(""),
  country: text("country").notNull().default(""),
  countryCode: text("country_code").notNull().default(""),
  state: text("state").notNull().default(""),
  stateCode: text("state_code").notNull().default(""),
  formattedLocation: text("formatted_location").notNull().default(""),
  lat: doublePrecision("lat").notNull().default(0),
  lon: doublePrecision("lon").notNull().default(0),
  location: geographyPoint("location"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
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
