import { index, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    userId: varchar("user_id").primaryKey(),
    username: varchar("username").notNull(),
    email: varchar("email").notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    profilePic: varchar("profile_pic"),
    role: varchar("role").default("member").notNull(),
    status: varchar("status").default("active").notNull(),
    preference: varchar("preference").default("light").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("users_username_idx").on(table.username)],
);

export type User = InferSelectModel<typeof users>;
export type PublicUser = Omit<User, "password">;
