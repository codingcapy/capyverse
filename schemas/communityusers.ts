import {
  pgTable,
  varchar,
  timestamp,
  serial,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const communityUsers = pgTable(
  "community_users",
  {
    communityUserId: serial("community_user_id").primaryKey(),
    userId: varchar("user_id").notNull(),
    communityId: varchar("community_id").notNull(),
    role: varchar("role").default("member").notNull(),
    status: varchar("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("community_users_user_created_idx").on(table.userId, table.createdAt),
    index("community_users_community_user_idx").on(
      table.communityId,
      table.userId,
    ),
    index("community_users_community_role_idx").on(
      table.communityId,
      table.role,
    ),
    index("community_users_community_user_status_idx").on(
      table.communityId,
      table.userId,
      table.status,
    ),
  ],
);

export type Community = InferSelectModel<typeof communityUsers>;
