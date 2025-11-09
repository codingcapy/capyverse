import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { posts as postsTable } from "../schemas/posts";
import { mightFail, mightFailSync } from "might-fail";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

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
      await mightFail(db.select().from(postsTable));
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
    console.log(postIdString);
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
  });
