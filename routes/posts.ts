import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono, type Context } from "hono";
import { posts as postsTable } from "../schemas/posts";
import { users as usersTable } from "../schemas/users";
import { images as imagesTable } from "../schemas/images";
import { votes as votesTable } from "../schemas/votes";
import { mightFail, mightFailSync } from "might-fail";
import { db } from "../db";
import { and, desc, eq, isNotNull, isNull, ne, sql, or } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { deleteImageFromS3 } from "./images";
import { savedPosts as savedPostsTable } from "../schemas/savedPosts";
import jwt from "jsonwebtoken";
import { communities as communitiesTable } from "../schemas/communities";
import { communityUsers as communityUsersTable } from "../schemas/communityusers";

const deletePostSchema = z.object({
  postId: z.number(),
});

const updatePostSchema = z.object({
  postId: z.number(),
  content: z.string(),
});

const savePostSchema = z.object({
  postId: z.number(),
});

export function assertIsParsableInt(id: string): number {
  const { result: parsedId, error: parseIdError } = mightFailSync(() =>
    z.coerce.number().int().parse(id),
  );
  if (parseIdError) {
    throw new HTTPException(400, {
      message: `Id ${id} cannot be parsed into a number.`,
      cause: parseIdError,
    });
  }
  return parsedId;
}

export function requireUser(c: Context) {
  const authHeader = c.req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }
  try {
    return jwt.verify(authHeader.split(" ")[1]!, process.env.JWT_SECRET!) as {
      id: string;
    };
  } catch {
    throw new HTTPException(401, { message: "Invalid token" });
  }
}

export function optionalUser(c: Context) {
  const authHeader = c.req.header("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  try {
    return jwt.verify(authHeader.split(" ")[1]!, process.env.JWT_SECRET!) as {
      id: string;
    };
  } catch {
    return null;
  }
}

export const postsRouter = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      createInsertSchema(postsTable).omit({
        userId: true,
        postId: true,
        status: true,
        createdAt: true,
      }),
    ),
    async (c) => {
      const decodedUser = requireUser(c);
      const insertValues = c.req.valid("json");
      if (insertValues.content && insertValues.content.length > 10000)
        throw new HTTPException(400, {
          message: "Post content length exceeds max char limit",
          cause: Error(),
        });
      if (insertValues.title && insertValues.title.length > 400)
        throw new HTTPException(400, {
          message: "Post title length exceeds max char limit",
          cause: Error(),
        });
      const { error: postInsertError, result: postInsertResult } =
        await mightFail(
          db
            .insert(postsTable)
            .values({ ...insertValues, userId: decodedUser.id })
            .returning(),
        );
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
                eq(imagesTable.userId, decodedUser.id),
                eq(imagesTable.posted, false),
              ),
            )
            .returning(),
        );
      if (imageUpdateError) {
        console.log("Error while updating image");
        throw new HTTPException(500, {
          message: "Error while updating image",
          cause: imageUpdateResult,
        });
      }
      return c.json({ postResult: postInsertResult[0] }, 200);
    },
  )
  .get("/", async (c) => {
    const user = optionalUser(c);
    const limit = Number(c.req.query("limit") ?? 10);
    const cursorPostId = c.req.query("cursorPostId");
    const cursorWhere = cursorPostId
      ? sql`${postsTable.postId} < ${Number(cursorPostId)}`
      : undefined;
    const { result, error } = await mightFail(
      db
        .select({
          post: postsTable,
        })
        .from(postsTable)
        .leftJoin(
          communitiesTable,
          eq(postsTable.communityId, communitiesTable.communityId),
        )
        .leftJoin(
          communityUsersTable,
          and(
            eq(communityUsersTable.communityId, postsTable.communityId),
            user ? eq(communityUsersTable.userId, user.id) : sql`false`,
          ),
        )
        .where(
          and(
            cursorWhere,
            or(
              isNull(postsTable.communityId), // Post not in a community
              ne(communitiesTable.visibility, "private"), // Community is not private
              isNotNull(communityUsersTable.userId), // User is a member
            ),
          ),
        )
        .orderBy(desc(postsTable.postId))
        .limit(limit + 1),
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
      posts: pageItems.map((row) => row.post),
      nextCursor: hasNextPage ? { postId: last!.post.postId } : null,
    });
  })
  .get("/popular", async (c) => {
    const limit = Number(c.req.query("limit") ?? 10);
    const cursorScore = c.req.query("cursorScore");
    const cursorPostId = c.req.query("cursorPostId");
    const scoreSubquery = db
      .select({
        postId: votesTable.postId,
        score: sql<number>`coalesce(sum(${votesTable.value}), 0)`.as("score"),
      })
      .from(votesTable)
      .where(
        and(
          sql`${votesTable.value} != 0`,
          sql`${votesTable.commentId} IS NULL`,
        ),
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
          desc(postsTable.postId),
        )
        .limit(limit + 1), // fetch one extra to detect next page
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
    const user = optionalUser(c);
    const { result: postsQueryResult, error: postsQueryError } =
      await mightFail(
        db.select().from(postsTable).where(eq(postsTable.userId, userId)),
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
  .get("/user/posts/:username", async (c) => {
    const username = c.req.param("username");
    const { result: users, error: userError } = await mightFail(
      db
        .select()
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
    const { result: posts, error: postsError } = await mightFail(
      db.select().from(postsTable).where(eq(postsTable.userId, user.userId)),
    );
    if (postsError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching posts by user id",
        cause: postsError,
      });
    }
    return c.json({
      posts,
    });
  })
  .get("/recent", async (c) => {
    const user = optionalUser(c);
    const { result, error } = await mightFail(
      db
        .select({
          post: postsTable,
          communityId: postsTable.communityId,
          visibility: communitiesTable.visibility,
          memberUserId: communityUsersTable.userId,
        })
        .from(postsTable)
        .leftJoin(
          communitiesTable,
          eq(postsTable.communityId, communitiesTable.communityId),
        )
        .leftJoin(
          communityUsersTable,
          and(
            eq(communityUsersTable.communityId, postsTable.communityId),
            user ? eq(communityUsersTable.userId, user.id) : sql`false`,
          ),
        )
        .where(
          or(
            isNull(postsTable.communityId),
            isNull(communitiesTable.visibility),
            ne(communitiesTable.visibility, "private"),
            isNotNull(communityUsersTable.userId),
          ),
        )
        .orderBy(desc(postsTable.postId))
        .limit(10),
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching recent posts",
        cause: error,
      });
    }
    return c.json({
      posts: result.map((row) => row.post),
    });
  })
  .get("/:postId", async (c) => {
    const { postId: postIdString } = c.req.param();
    const user = optionalUser(c);
    const postId = assertIsParsableInt(postIdString);
    const { result, error } = await mightFail(
      db
        .select({
          post: postsTable,
          visibility: communitiesTable.visibility,
          memberUserId: communityUsersTable.userId,
          communityId: postsTable.communityId,
        })
        .from(postsTable)
        .leftJoin(
          communitiesTable,
          eq(postsTable.communityId, communitiesTable.communityId),
        )
        .leftJoin(
          communityUsersTable,
          and(
            eq(communityUsersTable.communityId, postsTable.communityId),
            user ? eq(communityUsersTable.userId, user.id) : sql`false`,
          ),
        )
        .where(eq(postsTable.postId, postId))
        .limit(1),
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching post",
        cause: error,
      });
    }
    const row = result?.[0];
    if (!row) {
      throw new HTTPException(404, { message: "Post not found" });
    }
    if (row.communityId === null) {
      return c.json({ post: row.post });
    }
    if (row.visibility !== "private") {
      return c.json({ post: row.post });
    }
    if (row.memberUserId) {
      return c.json({ post: row.post });
    }
    throw new HTTPException(404, { message: "Post not found" });
  })
  .get(
    "/community/:communityId",
    zValidator(
      "query",
      z.object({
        cursorPostId: z.string().optional(),
        limit: z.string().optional(),
      }),
    ),
    async (c) => {
      const limit = Number(c.req.query("limit") ?? 10);
      const cursorPostId = c.req.query("cursorPostId");
      const cursorWhere = cursorPostId
        ? sql`${postsTable.postId} < ${Number(cursorPostId)}`
        : undefined;
      const { communityId } = c.req.param();
      const { result, error } = await mightFail(
        db
          .select()
          .from(postsTable)
          .where(and(cursorWhere, eq(postsTable.communityId, communityId)))
          .orderBy(desc(postsTable.postId)) // newest first
          .limit(limit + 1),
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
    },
  )
  .get(
    "/community/popular/:communityId",
    zValidator(
      "query",
      z.object({
        cursorScore: z.string().optional(),
        cursorPostId: z.string().optional(),
        limit: z.string().optional(),
      }),
    ),
    async (c) => {
      const limit = Number(c.req.query("limit") ?? 10);
      const cursorScore = c.req.query("cursorScore");
      const { communityId } = c.req.param();
      const cursorPostId = c.req.query("cursorPostId");
      const scoreSubquery = db
        .select({
          postId: votesTable.postId,
          score: sql<number>`coalesce(sum(${votesTable.value}), 0)`.as("score"),
        })
        .from(votesTable)
        .where(
          and(
            sql`${votesTable.value} != 0`,
            sql`${votesTable.commentId} IS NULL`,
          ),
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
          .where(and(cursorWhere, eq(postsTable.communityId, communityId)))
          .orderBy(
            desc(sql`coalesce(${scoreSubquery.score}, 0)`),
            desc(postsTable.postId),
          )
          .limit(limit + 1), // fetch one extra to detect next page
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
              postId: last!.post.postId,
            }
          : null,
      });
    },
  )
  .post("/post/delete", zValidator("json", deletePostSchema), async (c) => {
    const decodedUser = requireUser(c);
    const deleteValues = c.req.valid("json");
    const { error: postDeleteError, result: postDeleteResult } =
      await mightFail(
        db
          .update(postsTable)
          .set({ content: "[This post has been deleted by the user]" })
          .where(
            and(
              eq(postsTable.postId, deleteValues.postId),
              eq(postsTable.userId, decodedUser.id),
            ),
          )
          .returning(),
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
          .returning(),
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
    const decodedUser = requireUser(c);
    const updateValues = c.req.valid("json");
    const { error: postUpdateError, result: postUpdateResult } =
      await mightFail(
        db
          .update(postsTable)
          .set({ content: updateValues.content })
          .where(
            and(
              eq(postsTable.postId, updateValues.postId),
              eq(postsTable.userId, decodedUser.id),
            ),
          )
          .returning(),
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
    const decodedUser = requireUser(c);
    const saveValues = c.req.valid("json");
    const { result: savedPostQueryResult, error: savedPostsQueryError } =
      await mightFail(
        db
          .select()
          .from(savedPostsTable)
          .where(
            and(
              eq(savedPostsTable.userId, decodedUser.id),
              eq(savedPostsTable.postId, saveValues.postId),
            ),
          ),
      );
    if (savedPostsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching saved post",
        cause: savedPostsQueryError,
      });
    }
    if (savedPostQueryResult.length > 0) {
      throw new HTTPException(409, {
        message: "Saved post already exists",
        cause: savedPostsQueryError,
      });
    }
    const { error: postSaveError, result: postSaveResult } = await mightFail(
      db
        .insert(savedPostsTable)
        .values({ postId: saveValues.postId, userId: decodedUser.id })
        .returning(),
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
          .orderBy(desc(savedPostsTable.createdAt)), // optional but recommended
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
    const decodedUser = requireUser(c);
    const saveValues = c.req.valid("json");
    const { error: postUnsaveError, result: postUnsaveResult } =
      await mightFail(
        db
          .delete(savedPostsTable)
          .where(
            and(
              eq(savedPostsTable.postId, saveValues.postId),
              eq(savedPostsTable.userId, decodedUser.id),
            ),
          )
          .returning(),
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
