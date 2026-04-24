import {
  pgTable,
  varchar,
  timestamp,
  integer,
  serial,
  index,
} from "drizzle-orm/pg-core";
import { type InferSelectModel, sql } from "drizzle-orm";

export const votes = pgTable(
  "votes",
  {
    voteId: serial("vote_id").primaryKey(),
    userId: varchar("user_id").notNull(),
    postId: integer("post_id").notNull(),
    commentId: integer("comment_id"),
    value: integer("value"),
    status: varchar("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("votes_post_comment_idx").on(table.postId, table.commentId),
    index("votes_comment_id_idx").on(table.commentId),
    index("votes_user_post_comment_idx").on(
      table.userId,
      table.postId,
      table.commentId,
    ),
    index("votes_post_score_idx")
      .on(table.postId, table.value)
      .where(sql`comment_id IS NULL`),
  ],
);

export type Vote = InferSelectModel<typeof votes>;
