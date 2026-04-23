import {
  pgTable,
  varchar,
  timestamp,
  serial,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const posts = pgTable(
  "posts",
  {
    postId: serial("post_id").primaryKey(),
    userId: varchar("user_id").notNull(),
    communityId: varchar("community_id"),
    title: varchar("title").notNull(),
    content: varchar("content").notNull().default(""),
    status: varchar("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("posts_user_id_idx").on(table.userId),
    index("posts_community_post_idx").on(table.communityId, table.postId),
  ],
);

export type Post = InferSelectModel<typeof posts>;
