import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { posts as postsTable } from "../schemas/posts";
import { users as usersTable } from "../schemas/users";
import { mightFail, mightFailSync } from "might-fail";
import { db } from "../db";
import { desc, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

const deletePostSchema = z.object({
  postId: z.number(),
});

const updatePostSchema = z.object({
  postId: z.number(),
  content: z.string(),
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
    const insertValues = c.req.valid("json");
    const { error: postDeleteError, result: postDeleteResult } =
      await mightFail(
        db
          .update(postsTable)
          .set({ content: "[This post has beend deleted by the user]" })
          .where(eq(postsTable.postId, insertValues.postId))
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
    return c.json({ postResult: postDeleteResult[0] }, 200);
  })
  .post("/post/update", zValidator("json", updatePostSchema), async (c) => {
    const insertValues = c.req.valid("json");
    const { error: postUpdateError, result: postUpdateResult } =
      await mightFail(
        db
          .update(postsTable)
          .set({ content: insertValues.content })
          .where(eq(postsTable.postId, insertValues.postId))
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
  });
