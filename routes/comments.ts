import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { comments as commentsTable } from "../schemas/comments";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";

export const commentsRouter = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      createInsertSchema(commentsTable).omit({
        status: true,
        createdAt: true,
        commentId: true,
      })
    ),
    async (c) => {
      const insertValues = c.req.valid("json");
      console.log(insertValues);
      const { error: commentInsertError, result: commentInsertResult } =
        await mightFail(
          db.insert(commentsTable).values(insertValues).returning()
        );
      if (commentInsertError)
        throw new HTTPException(500, {
          message: "error creating comment",
          cause: commentInsertError,
        });
      return c.json({ comment: commentInsertResult });
    }
  )
  .get("/", async (c) => {
    const { result: commentsQueryResult, error: commentsQueryError } =
      await mightFail(db.select().from(commentsTable));
    if (commentsQueryError)
      throw new HTTPException(500, {
        message: "error querying comments",
        cause: commentsQueryError,
      });
    return c.json({ comments: commentsQueryResult });
  });
