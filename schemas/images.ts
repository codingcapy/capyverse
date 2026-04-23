import {
  pgTable,
  varchar,
  serial,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const images = pgTable(
  "images",
  {
    imageId: serial("image_id").primaryKey(),
    postId: integer("post_id"),
    userId: varchar("user_id").notNull(),
    imageUrl: varchar("image_url").notNull(),
    posted: boolean("posted").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("images_post_id_idx").on(table.postId),
    index("images_user_posted_idx").on(table.userId, table.posted),
  ],
);

export type ImagePost = InferSelectModel<typeof images>;
