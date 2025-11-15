import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { comments as commentsTable } from "../schemas/comments";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";
import { assertIsParsableInt } from "./posts";
import { eq } from "drizzle-orm";
import { users as usersTable } from "../schemas/users";

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
      await mightFail(
        db
          .select({
            commentId: commentsTable.commentId,
            userId: commentsTable.userId,
            postId: commentsTable.postId,
            level: commentsTable.level,
            content: commentsTable.content,
            status: commentsTable.status,
            createdAt: commentsTable.createdAt,
            username: usersTable.username,
          })
          .from(commentsTable)
          .innerJoin(usersTable, eq(commentsTable.userId, usersTable.userId))
      );
    if (commentsQueryError)
      throw new HTTPException(500, {
        message: "error querying comments",
        cause: commentsQueryError,
      });
    return c.json({ comments: commentsQueryResult });
  })
  .get("/:postId", async (c) => {
    const { postId: postIdString } = c.req.param();
    const postId = assertIsParsableInt(postIdString);
    const { result: commentsQueryResult, error: commentsQueryError } =
      await mightFail(
        db
          .select({
            commentId: commentsTable.commentId,
            userId: commentsTable.userId,
            postId: commentsTable.postId,
            level: commentsTable.level,
            content: commentsTable.content,
            status: commentsTable.status,
            createdAt: commentsTable.createdAt,
            username: usersTable.username,
          })
          .from(commentsTable)
          .innerJoin(usersTable, eq(commentsTable.userId, usersTable.userId))
          .where(eq(commentsTable.postId, postId))
      );
    if (commentsQueryError)
      throw new HTTPException(500, {
        message: "error querying comments",
        cause: commentsQueryError,
      });
    return c.json({ comments: commentsQueryResult });
  });
