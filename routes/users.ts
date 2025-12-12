import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { mightFail } from "might-fail";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { randomUUIDv7 } from "bun";
import { users as usersTable } from "../schemas/users";
import z from "zod";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

const updateProfilePicSchema = z.object({
  userId: z.string(),
  profilePic: z.string(),
});

export const usersRouter = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      createInsertSchema(usersTable).omit({
        userId: true,
        createdAt: true,
      })
    ),
    async (c) => {
      const insertValues = c.req.valid("json");
      const { error: unitQueryError, result: unitQueryResult } =
        await mightFail(
          db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, insertValues.email))
        );
      if (unitQueryError) {
        throw new HTTPException(500, {
          message: "Error while fetching user",
          cause: unitQueryError,
        });
      }
      if (unitQueryResult.length > 0) {
        return c.json(
          { message: "An account with this email already exists" },
          409
        );
      }
      const encrypted = await hashPassword(insertValues.password);
      const userId = randomUUIDv7();
      const { error: userInsertError, result: userInsertResult } =
        await mightFail(
          db
            .insert(usersTable)
            .values({
              userId: userId,
              username: insertValues.username,
              email: insertValues.email,
              password: encrypted,
            })
            .returning()
        );
      if (userInsertError) {
        console.log("Error while creating user");
        throw new HTTPException(500, {
          message: "Error while creating user",
          cause: userInsertResult,
        });
      }
      return c.json({ user: userInsertResult[0] }, 200);
    }
  )
  .get("/:userId", async (c) => {
    const { userId } = c.req.param();
    const { result: userQueryResult, error: userQueryError } = await mightFail(
      db
        .select({
          username: usersTable.username,
          profilePic: usersTable.profilePic,
        })
        .from(usersTable)
        .where(eq(usersTable.userId, userId))
    );
    if (userQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching user",
        cause: userQueryError,
      });
    }
    return c.json({
      userQuery: userQueryResult[0],
    });
  })
  .post(
    "/update/profilepic",
    zValidator("json", updateProfilePicSchema),
    async (c) => {
      const updateValues = c.req.valid("json");
      const { error: queryError, result: newUserResult } = await mightFail(
        db
          .update(usersTable)
          .set({ profilePic: updateValues.profilePic })
          .where(eq(usersTable.userId, updateValues.userId))
          .returning()
      );
      if (queryError) {
        throw new HTTPException(500, {
          message: "Error updating users table",
          cause: queryError,
        });
      }
      return c.json({ newUser: newUserResult[0] }, 200);
    }
  );
