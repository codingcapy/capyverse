import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { users as usersTable } from "../schemas/users";
import { createInsertSchema } from "drizzle-zod";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function verifyPassword(hash: string, password: string) {
  const parts = hash.split(":");
  if (parts.length !== 2) throw new Error("Invalid hash format");
  const [salt, keyHex] = parts as [string, string];
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const derivedKeyHex = Buffer.from(derivedKey.toString("hex"));
  const storedKeyHex = Buffer.from(keyHex);
  if (derivedKeyHex.length !== storedKeyHex.length) return false;
  return timingSafeEqual(derivedKeyHex, storedKeyHex);
}

const userSchema = z.object({
  userId: z.string(),
  username: z.string(),
  password: z.string(),
});

const loginSchema = userSchema.omit({
  userId: true,
});

export const userRouter = new Hono()
  .post(
    "/login",
    zValidator(
      "json",
      createInsertSchema(usersTable).omit({
        userId: true,
        username: true,
        role: true,
        status: true,
        preference: true,
        profilePic: true,
        createdAt: true,
      }),
    ),
    async (c) => {
      try {
        const loginInfo = c.req.valid("json");
        const queryResult = await db
          .select({
            userId: usersTable.userId,
            username: usersTable.username,
            email: usersTable.email,
            password: usersTable.password,
            profilePic: usersTable.profilePic,
            role: usersTable.role,
            status: usersTable.status,
            preference: usersTable.preference,
            createdAt: usersTable.createdAt,
          })
          .from(usersTable)
          .where(eq(usersTable.email, loginInfo.email));
        const user = queryResult[0];
        if (!user) return c.json({ result: { user: null, token: null } });
        const isPasswordValid = await verifyPassword(
          user.password,
          loginInfo.password,
        );
        if (!isPasswordValid) {
          return c.json({ result: { user: null, token: null } });
        }
        const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET!, {
          expiresIn: "14 days",
        });
        const {
          userId,
          username,
          email,
          profilePic,
          role,
          status,
          preference,
          createdAt,
        } = user;
        const safeUser = {
          userId,
          username,
          email,
          profilePic,
          role,
          status,
          preference,
          createdAt,
        };
        return c.json({ result: { user: safeUser, token } });
      } catch (error) {
        console.error(error);
        c.status(500);
        return c.json({ message: "Internal Server Error" });
      }
    },
  )
  .post("/validation", async (c) => {
    try {
      const authHeader = c.req.header("authorization");
      if (!authHeader) {
        c.status(403);
        return c.json({ message: "Header does not exist" });
      }
      const token = authHeader.split(" ")[1];
      const decodedUser = jwt.verify(token!, process.env.JWT_SECRET!);
      const response = await db
        .select({
          userId: usersTable.userId,
          username: usersTable.username,
          email: usersTable.email,
          profilePic: usersTable.profilePic,
          role: usersTable.role,
          status: usersTable.status,
          preference: usersTable.preference,
          createdAt: usersTable.createdAt,
        })
        .from(usersTable)
        //@ts-ignore
        .where(eq(usersTable.userId, decodedUser.id));
      const user = response[0];
      if (!user) {
        return c.json({ result: { user: null, token: null } });
      }
      return c.json({ result: { user, token } });
    } catch {
      c.status(401);
      return c.json({ message: "Unauthorized" });
    }
  });
