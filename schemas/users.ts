import { pgTable, varchar, timestamp } from "drizzle-orm/pg-core";
import type { InferSelectModel } from "drizzle-orm";

export const users = pgTable("users", {
  userId: varchar("user_id").primaryKey(),
  username: varchar("username"),
  email: varchar("email").notNull().unique(),
  password: varchar("password").notNull(),
  role: varchar("role").default("member").notNull(),
  status: varchar("status").default("active").notNull(),
  preference: varchar("preference").default("light").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type User = InferSelectModel<typeof users>;
