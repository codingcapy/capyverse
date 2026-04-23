import {
  pgTable,
  varchar,
  timestamp,
  serial,
  integer,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const savedComments = pgTable(
  "saved_comments",
  {
    savedCommentId: serial("saved_comment_id").primaryKey(),
    userId: varchar("user_id").notNull(),
    commentId: integer("comment_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("saved_comments_user_comment_idx").on(table.userId, table.commentId),
    index("saved_comments_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export type SavedComment = InferSelectModel<typeof savedComments>;
