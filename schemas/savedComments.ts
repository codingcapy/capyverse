import {
  pgTable,
  varchar,
  timestamp,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const savedComments = pgTable("saved_comments", {
  savedCommentId: serial("saved_comment_id").primaryKey(),
  userId: varchar("user_id").notNull(),
  commentId: integer("comment_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SavedComment = InferSelectModel<typeof savedComments>;
