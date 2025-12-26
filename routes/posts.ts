import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { posts as postsTable } from "../schemas/posts";
import { users as usersTable } from "../schemas/users";
import { images as imagesTable } from "../schemas/images";
import { votes as votesTable } from "../schemas/votes";
import { mightFail, mightFailSync } from "might-fail";
import { db } from "../db";
import { and, desc, eq, sql } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { deleteImageFromS3 } from "./images";
import { savedPosts as savedPostsTable } from "../schemas/savedPosts";

const deletePostSchema = z.object({
  postId: z.number(),
});

const updatePostSchema = z.object({
  postId: z.number(),
  content: z.string(),
});

const savePostSchema = z.object({
  userId: z.string(),
  postId: z.number(),
});

export function assertIsParsableInt(id: string): number {
  const { result: parsedId, error: parseIdError } = mightFailSync(() =>
    z.coerce.number().int().parse(id)
  );
  if (parseIdError) {
    throw new HTTPException(400, {
      message: `Id ${id} cannot be parsed into a number.`,
      cause: parseIdError,
    });
  }
  return parsedId;
}

export const postsRouter = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      createInsertSchema(postsTable).omit({
        postId: true,
        status: true,
        createdAt: true,
      })
    ),
    async (c) => {
      const insertValues = c.req.valid("json");
      if (insertValues.content && insertValues.content.length > 10000)
        throw new HTTPException(401, {
          message: "Post content length exceeds max char limit",
          cause: Error(),
        });
      if (insertValues.title && insertValues.title.length > 400)
        throw new HTTPException(401, {
          message: "Post title length exceeds max char limit",
          cause: Error(),
        });
      const { error: postInsertError, result: postInsertResult } =
        await mightFail(db.insert(postsTable).values(insertValues).returning());
      if (postInsertError) {
        console.log("Error while creating post");
        console.log(postInsertError);
        throw new HTTPException(500, {
          message: "Error while creating post",
          cause: postInsertError,
        });
      }
      const { error: imageUpdateError, result: imageUpdateResult } =
        await mightFail(
          db
            .update(imagesTable)
            .set({
              postId: postInsertResult[0] && postInsertResult[0].postId,
              posted: true,
            })
            .where(
              and(
                eq(imagesTable.userId, insertValues.userId),
                eq(imagesTable.posted, false)
              )
            )
            .returning()
        );
      if (imageUpdateError) {
        console.log("Error while updating image");
        throw new HTTPException(500, {
          message: "Error while updating image",
          cause: imageUpdateResult,
        });
      }
      return c.json({ postResult: postInsertResult[0] }, 200);
    }
  )
  .get("/", async (c) => {
    const limit = Number(c.req.query("limit") ?? 10);
    const cursorPostId = c.req.query("cursorPostId");
    const cursorWhere = cursorPostId
      ? sql`${postsTable.postId} < ${Number(cursorPostId)}`
      : undefined;
    const { result, error } = await mightFail(
      db
        .select()
        .from(postsTable)
        .where(cursorWhere)
        .orderBy(desc(postsTable.postId)) // newest first
        .limit(limit + 1)
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching posts",
        cause: error,
      });
    }
    const hasNextPage = result.length > limit;
    const pageItems = hasNextPage ? result.slice(0, limit) : result;
    const last = pageItems.at(-1);
    return c.json({
      posts: pageItems,
      nextCursor: hasNextPage ? { postId: last!.postId } : null,
    });
  })
  .get("/popular", async (c) => {
    const limit = Number(c.req.query("limit") ?? 10);
    const cursorScore = c.req.query("cursorScore");
    const cursorCreatedAt = c.req.query("cursorCreatedAt");
    const cursorPostId = c.req.query("cursorPostId");
    const scoreSubquery = db
      .select({
        postId: votesTable.postId,
        score: sql<number>`coalesce(sum(${votesTable.value}), 0)`.as("score"),
      })
      .from(votesTable)
      .where(
        and(sql`${votesTable.value} != 0`, sql`${votesTable.commentId} IS NULL`)
      )
      .groupBy(votesTable.postId)
      .as("scores");
    const cursorWhere =
      cursorScore && cursorPostId
        ? sql`
        (
          coalesce(${scoreSubquery.score}, 0) < ${Number(cursorScore)}
        )
        OR (
          coalesce(${scoreSubquery.score}, 0) = ${Number(cursorScore)}
          AND ${postsTable.postId} < ${Number(cursorPostId)}
        )
      `
        : undefined;
    const { result, error } = await mightFail(
      db
        .select({
          post: postsTable,
          score: sql<number>`coalesce(${scoreSubquery.score}, 0)`.as("score"),
        })
        .from(postsTable)
        .leftJoin(scoreSubquery, eq(scoreSubquery.postId, postsTable.postId))
        .where(cursorWhere)
        .orderBy(
          desc(sql`coalesce(${scoreSubquery.score}, 0)`),
          desc(postsTable.postId)
        )
        .limit(limit + 1) // fetch one extra to detect next page
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching popular posts",
        cause: error,
      });
    }
    const hasNextPage = result.length > limit;
    const pageItems = hasNextPage ? result.slice(0, limit) : result;
    const last = pageItems.at(-1);
    console.log({
      returned: pageItems.length,
      hasNextPage,
    });
    return c.json({
      posts: pageItems.map((r) => r.post),
      nextCursor: hasNextPage
        ? {
            score: last!.score,
            createdAt: last!.post.createdAt,
            postId: last!.post.postId,
          }
        : null,
    });
  })
  .get("/user/:userId", async (c) => {
    const userId = c.req.param("userId");
    const { result: postsQueryResult, error: postsQueryError } =
      await mightFail(
        db.select().from(postsTable).where(eq(postsTable.userId, userId))
      );
    if (postsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching posts by user id",
        cause: postsQueryError,
      });
    }
    return c.json({
      posts: postsQueryResult,
    });
  })
  .get("/recent", async (c) => {
    const { result: postsQueryResult, error: postsQueryError } =
      await mightFail(
        db.select().from(postsTable).orderBy(desc(postsTable.postId)).limit(10)
      );
    if (postsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching recent posts",
        cause: postsQueryError,
      });
    }
    return c.json({
      posts: postsQueryResult,
    });
  })
  .get("/:postId", async (c) => {
    const { postId: postIdString } = c.req.param();
    const postId = assertIsParsableInt(postIdString);
    const { result: postsQueryResult, error: postsQueryError } =
      await mightFail(
        db.select().from(postsTable).where(eq(postsTable.postId, postId))
      );
    if (postsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching post",
        cause: postsQueryError,
      });
    }
    return c.json({
      post: postsQueryResult[0],
    });
  })
  .get("/community/:communityId", async (c) => {
    const { communityId } = c.req.param();
    const { result: postsQueryResult, error: postsQueryError } =
      await mightFail(
        db
          .select()
          .from(postsTable)
          .where(eq(postsTable.communityId, communityId))
      );
    if (postsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching post",
        cause: postsQueryError,
      });
    }
    return c.json({
      posts: postsQueryResult,
    });
  })
  .post("/post/delete", zValidator("json", deletePostSchema), async (c) => {
    const deleteValues = c.req.valid("json");
    const { error: postDeleteError, result: postDeleteResult } =
      await mightFail(
        db
          .update(postsTable)
          .set({ content: "[This post has been deleted by the user]" })
          .where(eq(postsTable.postId, deleteValues.postId))
          .returning()
      );
    if (postDeleteError) {
      console.log("Error while deleting post");
      console.log(postDeleteError);
      throw new HTTPException(500, {
        message: "Error while deleting post",
        cause: postDeleteError,
      });
    }
    const { error: imageDeleteError, result: imageDeleteResult } =
      await mightFail(
        db
          .delete(imagesTable)
          .where(and(eq(imagesTable.postId, deleteValues.postId)))
          .returning()
      );
    if (imageDeleteError) {
      console.log("Error while updating image");
      throw new HTTPException(500, {
        message: "Error while updating image",
        cause: imageDeleteError,
      });
    }
    imageDeleteResult.map((image) => deleteImageFromS3(image.imageUrl));
    return c.json({ postResult: postDeleteResult[0] }, 200);
  })
  .post("/post/update", zValidator("json", updatePostSchema), async (c) => {
    const updateValues = c.req.valid("json");
    const { error: postUpdateError, result: postUpdateResult } =
      await mightFail(
        db
          .update(postsTable)
          .set({ content: updateValues.content })
          .where(eq(postsTable.postId, updateValues.postId))
          .returning()
      );
    if (postUpdateError) {
      console.log("Error while updatng post");
      console.log(postUpdateError);
      throw new HTTPException(500, {
        message: "Error while updating post",
        cause: postUpdateError,
      });
    }
    return c.json({ postResult: postUpdateResult[0] }, 200);
  })
  .post("/save", zValidator("json", savePostSchema), async (c) => {
    const saveValues = c.req.valid("json");
    const { result: savedPostQueryResult, error: savedPostsQueryError } =
      await mightFail(
        db
          .select()
          .from(savedPostsTable)
          .where(
            and(
              eq(savedPostsTable.userId, saveValues.userId),
              eq(savedPostsTable.postId, saveValues.postId)
            )
          )
      );
    if (savedPostsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching saved post",
        cause: savedPostsQueryError,
      });
    }
    if (savedPostQueryResult.length > 0) {
      throw new HTTPException(500, {
        message: "Saved post already exists",
        cause: savedPostsQueryError,
      });
    }
    const { error: postSaveError, result: postSaveResult } = await mightFail(
      db.insert(savedPostsTable).values(saveValues).returning()
    );
    if (postSaveError) {
      console.log("Error while creating post");
      console.log(postSaveError);
      throw new HTTPException(500, {
        message: "Error while creating post",
        cause: postSaveError,
      });
    }
    return c.json({ postResult: postSaveResult[0] }, 200);
  })
  .get("/saved/:userId", async (c) => {
    const userId = c.req.param("userId");
    const { result: savedPostsResult, error: savedPostsError } =
      await mightFail(
        db
          .select({
            postId: postsTable.postId,
            userId: postsTable.userId,
            communityId: postsTable.communityId,
            title: postsTable.title,
            content: postsTable.content,
            status: postsTable.status,
            createdAt: postsTable.createdAt,
          })
          .from(savedPostsTable)
          .innerJoin(postsTable, eq(savedPostsTable.postId, postsTable.postId))
          .innerJoin(usersTable, eq(postsTable.userId, usersTable.userId))
          .where(eq(savedPostsTable.userId, userId))
          .orderBy(desc(savedPostsTable.createdAt)) // optional but recommended
      );
    if (savedPostsError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching saved posts",
        cause: savedPostsError,
      });
    }
    return c.json({
      posts: savedPostsResult,
    });
  })
  .post("/unsave", zValidator("json", savePostSchema), async (c) => {
    const saveValues = c.req.valid("json");
    const { error: postUnsaveError, result: postUnsaveResult } =
      await mightFail(
        db
          .delete(savedPostsTable)
          .where(eq(savedPostsTable.postId, saveValues.postId))
          .returning()
      );
    if (postUnsaveError) {
      console.log("Error while creating post");
      console.log(postUnsaveError);
      throw new HTTPException(500, {
        message: "Error while creating post",
        cause: postUnsaveError,
      });
    }
    return c.json({ postResult: postUnsaveResult[0] }, 200);
  });
