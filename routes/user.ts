import { zValidator } from "@hono/zod-validator";
import { Hono, type Context } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { and, eq, isNull, lt } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { randomUUIDv7 } from "bun";
import { db } from "../db";
import { users as usersTable } from "../schemas/users";
import { refreshTokens as refreshTokensTable } from "../schemas/refreshTokens";
import { createInsertSchema } from "drizzle-zod";
import { createHash, randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const ACCESS_TOKEN_TTL = "15 minutes";
const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;
const ROTATION_GRACE_MS = 10 * 1000;
const REFRESH_COOKIE = "refresh_token";
const REFRESH_COOKIE_PATH = "/api/v0/user";

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

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function signAccessToken(userId: string) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

async function issueRefreshToken(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await db.insert(refreshTokensTable).values({
    tokenId: randomUUIDv7(),
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });
  return token;
}

function setRefreshCookie(c: Context, token: string) {
  setCookie(c, REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_MS / 1000,
  });
}

function clearRefreshCookie(c: Context) {
  deleteCookie(c, REFRESH_COOKIE, {
    path: REFRESH_COOKIE_PATH,
    secure: process.env.NODE_ENV === "production",
  });
}

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
        await db
          .delete(refreshTokensTable)
          .where(lt(refreshTokensTable.expiresAt, new Date()));
        const token = signAccessToken(user.userId);
        const refreshToken = await issueRefreshToken(user.userId);
        setRefreshCookie(c, refreshToken);
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
  .post("/refresh", async (c) => {
    try {
      const refreshToken = getCookie(c, REFRESH_COOKIE);
      if (!refreshToken) {
        return c.json({ message: "No refresh token" }, 401);
      }
      const [stored] = await db
        .select()
        .from(refreshTokensTable)
        .where(eq(refreshTokensTable.tokenHash, hashToken(refreshToken)));
      if (
        !stored ||
        stored.revokedAt ||
        stored.expiresAt.getTime() < Date.now()
      ) {
        clearRefreshCookie(c);
        return c.json({ message: "Invalid refresh token" }, 401);
      }
      if (stored.rotatedAt) {
        if (Date.now() - stored.rotatedAt.getTime() > ROTATION_GRACE_MS) {
          // An old token was reused outside the grace window: treat as theft
          await db
            .update(refreshTokensTable)
            .set({ revokedAt: new Date() })
            .where(
              and(
                eq(refreshTokensTable.userId, stored.userId),
                isNull(refreshTokensTable.revokedAt),
              ),
            );
          clearRefreshCookie(c);
          return c.json({ message: "Invalid refresh token" }, 401);
        }
        // Another tab just rotated this token; its new cookie is already set
        return c.json({ message: "Token was just rotated, retry" }, 409);
      }
      const rotated = await db
        .update(refreshTokensTable)
        .set({ rotatedAt: new Date() })
        .where(
          and(
            eq(refreshTokensTable.tokenId, stored.tokenId),
            isNull(refreshTokensTable.rotatedAt),
          ),
        )
        .returning({ tokenId: refreshTokensTable.tokenId });
      if (rotated.length === 0) {
        return c.json({ message: "Token was just rotated, retry" }, 409);
      }
      const [user] = await db
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
        .where(eq(usersTable.userId, stored.userId));
      if (!user) {
        clearRefreshCookie(c);
        return c.json({ message: "Invalid refresh token" }, 401);
      }
      const token = signAccessToken(user.userId);
      const newRefreshToken = await issueRefreshToken(user.userId);
      setRefreshCookie(c, newRefreshToken);
      return c.json({ result: { user, token } });
    } catch (error) {
      console.error(error);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  })
  .post("/logout", async (c) => {
    try {
      const refreshToken = getCookie(c, REFRESH_COOKIE);
      if (refreshToken) {
        await db
          .update(refreshTokensTable)
          .set({ revokedAt: new Date() })
          .where(eq(refreshTokensTable.tokenHash, hashToken(refreshToken)));
      }
      clearRefreshCookie(c);
      return c.json({ message: "Logged out" });
    } catch (error) {
      console.error(error);
      clearRefreshCookie(c);
      return c.json({ message: "Internal Server Error" }, 500);
    }
  });
