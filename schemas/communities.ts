import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const communities = pgTable(
  "communities",
  {
    communityId: varchar("community_id").primaryKey(),
    description: varchar("description").notNull().unique(),
    category: varchar("category").default("technology").notNull(),
    visibility: varchar("visibility").default("private").notNull(),
    mature: boolean().default(false).notNull(),
    icon: varchar(),
    banner: varchar(),
    status: varchar("status").default("active").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("communities_visibility_idx").on(table.visibility),
    index("communities_visibility_community_idx").on(
      table.visibility,
      table.communityId,
    ),
  ],
);

export type Community = InferSelectModel<typeof communities>;
