import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { votes as votesTable } from "../schemas/votes";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import z from "zod";
import { assertIsParsableInt, requireUser } from "./posts";

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
        userId: true,
      }),
    ),
    async (c) => {
      const decodedUser = requireUser(c);
      const insertValues = c.req.valid("json");
      if (
        insertValues.commentId !== null &&
        insertValues.commentId !== undefined
      ) {
        const { result: votesQueryResult, error: votesQueryError } =
          await mightFail(
            db
              .select()
              .from(votesTable)
              .where(
                and(
                  eq(votesTable.userId, decodedUser.id),
                  eq(votesTable.postId, insertValues.postId),
                  eq(votesTable.commentId, insertValues.commentId),
                ),
              ),
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
      } else {
        const { result: votesQueryResult, error: votesQueryError } =
          await mightFail(
            db
              .select()
              .from(votesTable)
              .where(
                and(
                  eq(votesTable.userId, decodedUser.id),
                  eq(votesTable.postId, insertValues.postId),
                  isNull(votesTable.commentId),
                ),
              ),
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
      }
      const { error: voteInsertError, result: voteInsertResult } =
        await mightFail(
          db
            .insert(votesTable)
            .values({ ...insertValues, userId: decodedUser.id })
            .returning(),
        );
      if (voteInsertError) {
        console.log("Error while creating vote");
        console.log(voteInsertError);
        throw new HTTPException(500, {
          message: "Error while creating vote",
          cause: voteInsertError,
        });
      }
      return c.json({ vote: voteInsertResult[0] }, 200);
    },
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
    const decodedUser = requireUser(c);
    const insertValues = c.req.valid("json");
    const { error: voteUpdateError, result: voteUpdateResult } =
      await mightFail(
        db
          .update(votesTable)
          .set({
            value: insertValues.value,
          })
          .where(
            and(
              eq(votesTable.voteId, insertValues.voteId),
              eq(votesTable.userId, decodedUser.id),
            ),
          )
          .returning(),
      );
    if (voteUpdateError) {
      console.log("Error while updating vote");
      throw new HTTPException(500, {
        message: "Error while updating vote",
        cause: voteUpdateError,
      });
    }
    console.log("update result:", voteUpdateResult);
    return c.json({ vote: voteUpdateResult[0] }, 200);
  })
  .get("/:postId", async (c) => {
    const { postId: postIdString } = c.req.param();
    const postId = assertIsParsableInt(postIdString);
    const { result: votesQueryResult, error: votesQueryError } =
      await mightFail(
        db.select().from(votesTable).where(eq(votesTable.postId, postId)),
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
        db.select().from(votesTable).where(eq(votesTable.commentId, commentId)),
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
  })
  .get("/post/summary/:postId", async (c) => {
    const postId = assertIsParsableInt(c.req.param("postId"));
    const { result, error } = await mightFail(
      db
        .select({
          upvotes: sql<number>`SUM(CASE WHEN ${votesTable.value} = 1 THEN 1 ELSE 0 END)`,
          downvotes: sql<number>`SUM(CASE WHEN ${votesTable.value} = -1 THEN 1 ELSE 0 END)`,
          score: sql<number>`COALESCE(SUM(${votesTable.value}), 0)`,
        })
        .from(votesTable)
        .where(
          and(eq(votesTable.postId, postId), isNull(votesTable.commentId)),
        ),
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Error fetching vote summary",
        cause: error,
      });
    }
    return c.json(
      result[0] ?? {
        upvotes: 0,
        downvotes: 0,
        score: 0,
      },
    );
  })
  .get("/post/user/:postId/:userId", async (c) => {
    const postId = assertIsParsableInt(c.req.param("postId"));
    const userId = c.req.param("userId");
    const { result, error } = await mightFail(
      db
        .select({
          voteId: votesTable.voteId,
          value: votesTable.value,
        })
        .from(votesTable)
        .where(
          and(
            eq(votesTable.postId, postId),
            eq(votesTable.userId, userId),
            isNull(votesTable.commentId),
          ),
        )
        .limit(1),
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Error fetching user vote",
        cause: error,
      });
    }
    return c.json({
      voted: result.length > 0,
      value: result[0]?.value ?? null, // 1 | -1 | null
      voteId: result[0]?.voteId ?? null,
    });
  });
