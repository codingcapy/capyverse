import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { posts as postsTable } from "../schemas/posts";
import { users as usersTable } from "../schemas/users";
import { images as imagesTable } from "../schemas/images";
import { mightFail, mightFailSync } from "might-fail";
import { db } from "../db";
import { and, desc, eq } from "drizzle-orm";
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
    const { result: postsQueryResult, error: postsQueryError } =
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
            username: usersTable.username,
          })
          .from(postsTable)
          .innerJoin(usersTable, eq(postsTable.userId, usersTable.userId))
          .orderBy(desc(postsTable.createdAt))
          .limit(100)
      );
    if (postsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching posts",
        cause: postsQueryError,
      });
    }
    return c.json({
      posts: postsQueryResult,
    });
  })
  .get("/user/:userId", async (c) => {
    const userId = c.req.param("userId");
    const { result: postsQueryResult, error: postsQueryError } =
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
            username: usersTable.username,
          })
          .from(postsTable)
          .innerJoin(usersTable, eq(postsTable.userId, usersTable.userId))
          .where(eq(postsTable.userId, userId))
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
            userId: postsTable.userId, // author id
            communityId: postsTable.communityId,
            title: postsTable.title,
            content: postsTable.content,
            status: postsTable.status,
            createdAt: postsTable.createdAt,
            username: usersTable.username, // author username
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
