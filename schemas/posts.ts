import { pgTable, varchar, timestamp, serial } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const posts = pgTable("posts", {
  postId: serial("post_id").primaryKey(),
  userId: varchar("user_id").notNull(),
  communityId: varchar("community_id"),
  title: varchar("title").notNull(),
  content: varchar("content").notNull(),
  status: varchar("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Post = InferSelectModel<typeof posts>;
