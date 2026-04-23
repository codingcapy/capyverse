import {
  pgTable,
  varchar,
  timestamp,
  serial,
  integer,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const savedPosts = pgTable(
  "saved_posts",
  {
    savedPostId: serial("saved_post_id").primaryKey(),
    userId: varchar("user_id").notNull(),
    postId: integer("post_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("saved_posts_user_post_idx").on(table.userId, table.postId),
    index("saved_posts_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type SavedPost = InferSelectModel<typeof savedPosts>;
