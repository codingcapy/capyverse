import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const communityUsers = pgTable("community_users", {
  communityUserId: serial("community_user_id").primaryKey(),
  userId: varchar("user_id").notNull(),
  communityId: varchar("community_id").notNull(),
  role: varchar("role").default("member").notNull(),
  status: varchar("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Community = InferSelectModel<typeof communityUsers>;
