import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const songClipsSchema = pgTable("song_clips", {
  id: serial("id").primaryKey(),
  title: text("title"),
  db_url: text("db_url"),
  full_song_url: text("full_song_url"),
});

export const artistProfilesSchema = pgTable("artist_profile", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  contactEmail: text("contact_email"),
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
  artistName: text("artist_name"),
  artistDescription: text("artist_description"),
  artistLogo: text("artist_logo"),
  genre: text("genre"),
  members: text("members").array().notNull(),
  joinedDate: timestamp("joined_date").defaultNow(),
  songClips: text("song_clips").array().notNull(),
  membersWithAccess: uuid("members_with_access").array().notNull(),
});

export const listenerProfilesSchema = pgTable("listener_profile", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email"),
  genres: text("genres").array().notNull(),
  location: text("location"),
  joinedDate: timestamp("joined_date").defaultNow(),
  liked_artists: text("liked_artists").array().notNull(),
  userIdRef: uuid("user_id_ref").notNull(),
});
