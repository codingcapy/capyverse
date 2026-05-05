import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { comments as commentsTable } from "../schemas/comments";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";
import { assertIsParsableInt, optionalUser, requireUser } from "./posts";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { users as usersTable } from "../schemas/users";
import z from "zod";
import { savedComments as savedCommentsTable } from "../schemas/savedComments";
import { posts as postsTable } from "../schemas/posts";
import { communities as communitiesTable } from "../schemas/communities";

const deleteCommentSchema = z.object({
  commentId: z.number(),
});

const updateCommentSchema = z.object({
  commentId: z.number(),
  content: z.string(),
});

const saveCommentSchema = z.object({
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
        userId: true,
      }),
    ),
    async (c) => {
      const decodedUser = requireUser(c);
      const insertValues = c.req.valid("json");
      const { error: commentInsertError, result: commentInsertResult } =
        await mightFail(
          db
            .insert(commentsTable)
            .values({ ...insertValues, userId: decodedUser.id })
            .returning(),
        );
      if (commentInsertError)
        throw new HTTPException(500, {
          message: "error creating comment",
          cause: commentInsertError,
        });
      return c.json({ comment: commentInsertResult });
    },
  )
  .get("/", async (c) => {
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const cursorCommentId = c.req.query("cursorCommentId");
    const cursorWhere = cursorCommentId
      ? sql`${commentsTable.commentId} < ${Number(cursorCommentId)}`
      : undefined;
    const visibilityFilter = ne(communitiesTable.visibility, "private");
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
            score: commentsTable.score,
            createdAt: commentsTable.createdAt,
          })
          .from(commentsTable)
          .innerJoin(postsTable, eq(commentsTable.postId, postsTable.postId))
          .innerJoin(
            communitiesTable,
            eq(postsTable.communityId, communitiesTable.communityId),
          )
          .where(
            cursorWhere
              ? sql`${cursorWhere} AND ${visibilityFilter}`
              : visibilityFilter,
          )
          .orderBy(desc(commentsTable.commentId))
          .limit(limit + 1),
      );
    if (commentsQueryError)
      throw new HTTPException(500, {
        message: "error querying comments",
        cause: commentsQueryError,
      });
    const hasNextPage = commentsQueryResult.length > limit;
    const pageItems = hasNextPage
      ? commentsQueryResult.slice(0, limit)
      : commentsQueryResult;
    const last = pageItems.at(-1);
    return c.json({
      comments: pageItems,
      nextCursor: hasNextPage ? { commentId: last!.commentId } : null,
    });
  })
  .get("/:postId", async (c) => {
    const { postId: postIdString } = c.req.param();
    const postId = assertIsParsableInt(postIdString);
    const limit = Math.min(Number(c.req.query("limit") ?? 50), 100);
    const cursorCommentId = c.req.query("cursorCommentId");
    const { result: commentsQueryResult, error: commentsQueryError } =
      await mightFail(
        db
          .select()
          .from(commentsTable)
          .where(
            cursorCommentId
              ? and(
                  eq(commentsTable.postId, postId),
                  sql`${commentsTable.commentId} < ${Number(cursorCommentId)}`,
                )
              : eq(commentsTable.postId, postId),
          )
          .orderBy(desc(commentsTable.commentId))
          .limit(limit + 1),
      );
    if (commentsQueryError)
      throw new HTTPException(500, {
        message: "error querying comments",
        cause: commentsQueryError,
      });
    const hasNextPage = commentsQueryResult.length > limit;
    const pageItems = hasNextPage
      ? commentsQueryResult.slice(0, limit)
      : commentsQueryResult;
    const last = pageItems.at(-1);
    return c.json({
      comments: pageItems,
      nextCursor: hasNextPage ? { commentId: last!.commentId } : null,
    });
  })
  .get("/user/comments/:username", async (c) => {
    const username = c.req.param("username");
    const limit = Math.min(Number(c.req.query("limit") ?? 20), 50);
    const cursorCommentId = c.req.query("cursorCommentId");
    const { result: users, error: userError } = await mightFail(
      db
        .select({ userId: usersTable.userId })
        .from(usersTable)
        .where(eq(usersTable.username, username))
        .limit(1),
    );
    if (userError) {
      throw new HTTPException(500, {
        message: "Error fetching user by username",
        cause: userError,
      });
    }
    if (users.length === 0) {
      throw new HTTPException(404, {
        message: "User not found",
      });
    }
    const user = users[0];
    if (!user) {
      throw new HTTPException(404, { message: "User not found" });
    }
    const { result: comments, error: commentsError } = await mightFail(
      db
        .select()
        .from(commentsTable)
        .where(
          cursorCommentId
            ? and(
                sql`${commentsTable.commentId} < ${Number(cursorCommentId)}`,
                eq(commentsTable.userId, user.userId),
              )
            : eq(commentsTable.userId, user.userId),
        )
        .orderBy(desc(commentsTable.commentId))
        .limit(limit + 1),
    );
    if (commentsError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching comments by username",
        cause: commentsError,
      });
    }
    const hasNextPage = comments.length > limit;
    const pageItems = hasNextPage ? comments.slice(0, limit) : comments;
    const last = pageItems.at(-1);
    return c.json({
      comments: pageItems,
      nextCursor: hasNextPage ? { commentId: last!.commentId } : null,
    });
  })
  .post(
    "/comment/delete",
    zValidator("json", deleteCommentSchema),
    async (c) => {
      const decodedUser = requireUser(c);
      const insertValues = c.req.valid("json");
      const { error: commentDeleteError, result: commentDeleteResult } =
        await mightFail(
          db
            .update(commentsTable)
            .set({ content: "[This comment has been deleted by the user]" })
            .where(
              and(
                eq(commentsTable.commentId, insertValues.commentId),
                eq(commentsTable.userId, decodedUser.id),
              ),
            )
            .returning(),
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
    },
  )
  .post(
    "/comment/update",
    zValidator("json", updateCommentSchema),
    async (c) => {
      const decodedUser = requireUser(c);
      const insertValues = c.req.valid("json");
      const { error: commentEditError, result: commentEditResult } =
        await mightFail(
          db
            .update(commentsTable)
            .set({ content: insertValues.content })
            .where(
              and(
                eq(commentsTable.commentId, insertValues.commentId),
                eq(commentsTable.userId, decodedUser.id),
              ),
            )
            .returning(),
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
    },
  )
  .get("/user/profile", async (c) => {
    const decodedUser = requireUser(c);
    const limit = Math.min(Number(c.req.query("limit") ?? 20), 50);
    const cursorCommentId = c.req.query("cursorCommentId");
    const { result: commentsQueryResult, error: commentsQueryError } =
      await mightFail(
        db
          .select()
          .from(commentsTable)
          .where(
            cursorCommentId
              ? and(
                  sql`${commentsTable.commentId} < ${Number(cursorCommentId)}`,
                  eq(commentsTable.userId, decodedUser.id),
                )
              : eq(commentsTable.userId, decodedUser.id),
          )
          .orderBy(desc(commentsTable.commentId))
          .limit(limit + 1),
      );
    if (commentsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching comments by user id",
        cause: commentsQueryError,
      });
    }
    const hasNextPage = commentsQueryResult.length > limit;
    const pageItems = hasNextPage
      ? commentsQueryResult.slice(0, limit)
      : commentsQueryResult;
    const last = pageItems.at(-1);
    return c.json({
      comments: pageItems,
      nextCursor: hasNextPage ? { commentId: last!.commentId } : null,
    });
  })
  .get("/post/count/:postId", async (c) => {
    const { postId: postIdString } = c.req.param();
    const postId = assertIsParsableInt(postIdString);
    const { result: countResult, error: commentsQueryError } = await mightFail(
      db
        .select({ count: sql<number>`count(*)` })
        .from(commentsTable)
        .where(eq(commentsTable.postId, postId)),
    );
    if (commentsQueryError)
      throw new HTTPException(500, {
        message: "error querying comments",
        cause: commentsQueryError,
      });
    return c.json({ commentsLength: Number(countResult[0]?.count ?? 0) });
  })
  .post("/save", zValidator("json", saveCommentSchema), async (c) => {
    const decodedUser = requireUser(c);
    const saveValues = c.req.valid("json");
    const { result: savedCommentQueryResult, error: savedCommentsQueryError } =
      await mightFail(
        db
          .select()
          .from(savedCommentsTable)
          .where(
            and(
              eq(savedCommentsTable.userId, decodedUser.id),
              eq(savedCommentsTable.commentId, saveValues.commentId),
            ),
          ),
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
        db
          .insert(savedCommentsTable)
          .values({ ...saveValues, userId: decodedUser.id })
          .returning(),
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
