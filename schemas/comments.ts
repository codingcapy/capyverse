import {
  pgTable,
  varchar,
  timestamp,
  integer,
  serial,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const comments = pgTable("comments", {
  commentId: serial("comment_id").primaryKey(),
  userId: varchar("user_id").notNull(),
  postId: integer("post_id").notNull(),
  level: integer("level"),
  content: integer("content"),
  status: varchar("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Comment = InferSelectModel<typeof comments>;
