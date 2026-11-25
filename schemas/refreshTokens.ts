import { index, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";
import { users } from "./users";

export const refreshTokens = pgTable(
  "refresh_tokens",
  {
    tokenId: varchar("token_id").primaryKey(),
    userId: varchar("user_id")
      .notNull()
      .references(() => users.userId, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    rotatedAt: timestamp("rotated_at"),
    revokedAt: timestamp("revoked_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("refresh_tokens_user_id_idx").on(table.userId)],
);

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
