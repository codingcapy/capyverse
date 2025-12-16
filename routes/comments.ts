import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { comments as commentsTable } from "../schemas/comments";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";
import { assertIsParsableInt } from "./posts";
import { and, eq } from "drizzle-orm";
import { users as usersTable } from "../schemas/users";
import z from "zod";
import { savedComments as savedCommentsTable } from "../schemas/savedComments";

const deleteCommentSchema = z.object({
  commentId: z.number(),
});

const updateCommentSchema = z.object({
  commentId: z.number(),
  content: z.string(),
});

const saveCommentSchema = z.object({
  userId: z.string(),
  commentId: z.number(),
});

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
            parentCommentId: commentsTable.parentCommentId,
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
            parentCommentId: commentsTable.parentCommentId,
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
  })
  .post(
    "/comment/delete",
    zValidator("json", deleteCommentSchema),
    async (c) => {
      const insertValues = c.req.valid("json");
      const { error: commentDeleteError, result: commentDeleteResult } =
        await mightFail(
          db
            .update(commentsTable)
            .set({ content: "[This comment has been deleted by the user]" })
            .where(eq(commentsTable.commentId, insertValues.commentId))
            .returning()
        );
      if (commentDeleteError) {
        console.log("Error while deleting comment");
        console.log(commentDeleteError);
        throw new HTTPException(500, {
          message: "Error while deleting comment",
          cause: commentDeleteError,
        });
      }
      return c.json({ commentResult: commentDeleteResult[0] }, 200);
    }
  )
  .post(
    "/comment/update",
    zValidator("json", updateCommentSchema),
    async (c) => {
      const insertValues = c.req.valid("json");
      const { error: commentEditError, result: commentEditResult } =
        await mightFail(
          db
            .update(commentsTable)
            .set({ content: insertValues.content })
            .where(eq(commentsTable.commentId, insertValues.commentId))
            .returning()
        );
      if (commentEditError) {
        console.log("Error while editing comment");
        console.log(commentEditError);
        throw new HTTPException(500, {
          message: "Error while editing comment",
          cause: commentEditError,
        });
      }
      return c.json({ commentResult: commentEditResult[0] }, 200);
    }
  )
  .get("/user/:userId", async (c) => {
    const userId = c.req.param("userId");
    const { result: commentsQueryResult, error: commentsQueryError } =
      await mightFail(
        db
          .select({
            commentId: commentsTable.commentId,
            userId: commentsTable.userId,
            postId: commentsTable.postId,
            parentCommentId: commentsTable.parentCommentId,
            level: commentsTable.level,
            content: commentsTable.content,
            status: commentsTable.status,
            createdAt: commentsTable.createdAt,
            username: usersTable.username,
          })
          .from(commentsTable)
          .innerJoin(usersTable, eq(commentsTable.userId, usersTable.userId))
          .where(eq(commentsTable.userId, userId))
      );
    if (commentsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching comments by user id",
        cause: commentsQueryError,
      });
    }
    return c.json({
      comments: commentsQueryResult,
    });
  })
  .post("/save", zValidator("json", saveCommentSchema), async (c) => {
    const saveValues = c.req.valid("json");
    const { result: savedCommentQueryResult, error: savedCommentsQueryError } =
      await mightFail(
        db
          .select()
          .from(savedCommentsTable)
          .where(
            and(
              eq(savedCommentsTable.userId, saveValues.userId),
              eq(savedCommentsTable.commentId, saveValues.commentId)
            )
          )
      );
    if (savedCommentsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching saved comment",
        cause: savedCommentsQueryError,
      });
    }
    if (savedCommentQueryResult.length > 0) {
      throw new HTTPException(500, {
        message: "Saved comment already exists",
        cause: savedCommentsQueryError,
      });
    }
    const { error: commentSaveError, result: commentSaveResult } =
      await mightFail(
        db.insert(savedCommentsTable).values(saveValues).returning()
      );
    if (commentSaveError) {
      console.log("Error while creating saved comment");
      console.log(commentSaveError);
      throw new HTTPException(500, {
        message: "Error while creating saved comment",
        cause: commentSaveError,
      });
    }
    return c.json({ commentResult: commentSaveResult[0] }, 200);
  });
