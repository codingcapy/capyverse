import {
  pgTable,
  varchar,
  timestamp,
  integer,
  serial,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const comments = pgTable(
  "comments",
  {
    commentId: serial("comment_id").primaryKey(),
    userId: varchar("user_id").notNull(),
    postId: integer("post_id").notNull(),
    parentCommentId: integer("parent_comment_id"),
    level: integer("level").default(0).notNull(),
    content: varchar("content"),
    status: varchar("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("comments_post_id_idx").on(table.postId),
    index("comments_user_id_idx").on(table.userId),
    index("comments_parent_comment_id_idx").on(table.parentCommentId),
  ],
);

export type Comment = InferSelectModel<typeof comments>;
