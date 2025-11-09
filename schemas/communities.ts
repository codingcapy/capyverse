import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const posts = pgTable("posts", {
  communityId: varchar("community_id").primaryKey(),
  title: varchar("title").notNull(),
  description: varchar("description").notNull().unique(),
  status: varchar("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Posts = InferSelectModel<typeof posts>;
