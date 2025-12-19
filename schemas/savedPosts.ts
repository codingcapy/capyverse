import {
  pgTable,
  varchar,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const savedPosts = pgTable("saved_posts", {
  savedPostId: serial("saved_post_id").primaryKey(),
  userId: varchar("user_id").notNull(),
  postId: integer("post_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SavedPost = InferSelectModel<typeof savedPosts>;
