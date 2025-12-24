import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const communities = pgTable("communities", {
  communityId: serial("community_id").primaryKey(),
  title: varchar("title").notNull(),
  description: varchar("description").notNull().unique(),
  category: varchar("category").default("technology").notNull(),
  visibility: varchar("visibility").default("private").notNull(),
  mature: boolean().default(false),
  status: varchar("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Community = InferSelectModel<typeof communities>;
