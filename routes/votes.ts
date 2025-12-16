import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { votes as votesTable } from "../schemas/votes";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";
import { and, eq, isNull } from "drizzle-orm";
import z from "zod";
import { assertIsParsableInt } from "./posts";

const updateVoteSchema = z.object({
  voteId: z.number(),
  value: z.number(),
});

export const votesRouter = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      createInsertSchema(votesTable).omit({
        status: true,
        createdAt: true,
      })
    ),
    async (c) => {
      const insertValues = c.req.valid("json");
      const { result: votesQueryResult, error: votesQueryError } =
        await mightFail(
          db
            .select()
            .from(votesTable)
            .where(
              and(
                eq(votesTable.userId, insertValues.userId),
                eq(votesTable.postId, insertValues.postId),
                isNull(votesTable.commentId)
              )
            )
        );
      if (votesQueryError) {
        throw new HTTPException(500, {
          message: "Error occurred when fetching vote",
          cause: votesQueryError,
        });
      }
      if (votesQueryResult.length > 0) {
        throw new HTTPException(500, {
          message: "Vote already exists",
          cause: votesQueryError,
        });
      }
      const { error: voteInsertError, result: voteInsertResult } =
        await mightFail(db.insert(votesTable).values(insertValues).returning());
      if (voteInsertError) {
        console.log("Error while creating vote");
        console.log(voteInsertError);
        throw new HTTPException(500, {
          message: "Error while creating vote",
          cause: voteInsertError,
        });
      }
      return c.json({ vote: voteInsertResult[0] }, 200);
    }
  )
  .get("/", async (c) => {
    const { result: votesQueryResult, error: votesQueryError } =
      await mightFail(db.select().from(votesTable));
    if (votesQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching votes",
        cause: votesQueryError,
      });
    }
    return c.json({
      votes: votesQueryResult,
    });
  })
  .post("/update", zValidator("json", updateVoteSchema), async (c) => {
    const insertValues = c.req.valid("json");
    const { error: voteUpdateError, result: voteUpdateResult } =
      await mightFail(
        db
          .update(votesTable)
          .set({
            value: insertValues.value,
          })
          .where(eq(votesTable.voteId, insertValues.voteId))
          .returning()
      );
    if (voteUpdateError) {
      console.log("Error while updating vote");
      throw new HTTPException(500, {
        message: "Error while updating vote",
        cause: voteUpdateError,
      });
    }
    return c.json({ request: voteUpdateResult[0] }, 200);
  })
  .get("/:postId", async (c) => {
    const { postId: postIdString } = c.req.param();
    const postId = assertIsParsableInt(postIdString);
    const { result: votesQueryResult, error: votesQueryError } =
      await mightFail(
        db.select().from(votesTable).where(eq(votesTable.postId, postId))
      );
    if (votesQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching votes",
        cause: votesQueryError,
      });
    }
    return c.json({
      votes: votesQueryResult,
    });
  })
  .get("/comments/:commentId", async (c) => {
    const { commentId: commentIdString } = c.req.param();
    const commentId = assertIsParsableInt(commentIdString);
    const { result: commentVotesQueryResult, error: commentVotesQueryError } =
      await mightFail(
        db.select().from(votesTable).where(eq(votesTable.commentId, commentId))
      );
    if (commentVotesQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching comment votes",
        cause: commentVotesQueryError,
      });
    }
    return c.json({
      votes: commentVotesQueryResult,
    });
  });
