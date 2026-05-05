import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { votes as votesTable } from "../schemas/votes";
import { posts as postsTable } from "../schemas/posts";
import { comments as commentsTable } from "../schemas/comments";
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
      // Update denormalized score
      const scoreValue = insertValues.value ?? 0;
      if (scoreValue !== 0) {
        if (
          insertValues.commentId !== null &&
          insertValues.commentId !== undefined
        ) {
          await db
            .update(commentsTable)
            .set({ score: sql`${commentsTable.score} + ${scoreValue}` })
            .where(eq(commentsTable.commentId, insertValues.commentId));
        } else {
          await db
            .update(postsTable)
            .set({ score: sql`${postsTable.score} + ${scoreValue}` })
            .where(eq(postsTable.postId, insertValues.postId));
        }
      }
      return c.json({ vote: voteInsertResult[0] }, 200);
    },
  )
  .post("/update", zValidator("json", updateVoteSchema), async (c) => {
    const decodedUser = requireUser(c);
    const { voteId, value: newValue } = c.req.valid("json");
    // Fetch old vote to compute score delta
    const { result: oldVotes, error: oldVoteError } = await mightFail(
      db
        .select()
        .from(votesTable)
        .where(
          and(
            eq(votesTable.voteId, voteId),
            eq(votesTable.userId, decodedUser.id),
          ),
        )
        .limit(1),
    );
    if (oldVoteError) {
      throw new HTTPException(500, { message: "Error fetching vote" });
    }
    const oldVote = oldVotes[0];
    if (!oldVote) {
      throw new HTTPException(404, { message: "Vote not found" });
    }
    const delta = (newValue ?? 0) - (oldVote.value ?? 0);
    const { error: voteUpdateError, result: voteUpdateResult } =
      await mightFail(
        db
          .update(votesTable)
          .set({ value: newValue })
          .where(
            and(
              eq(votesTable.voteId, voteId),
              eq(votesTable.userId, decodedUser.id),
            ),
          )
          .returning(),
      );
    if (voteUpdateError) {
      throw new HTTPException(500, {
        message: "Error while updating vote",
        cause: voteUpdateError,
      });
    }
    // Apply score delta to post or comment
    if (delta !== 0) {
      if (oldVote.commentId !== null) {
        await db
          .update(commentsTable)
          .set({ score: sql`${commentsTable.score} + ${delta}` })
          .where(eq(commentsTable.commentId, oldVote.commentId));
      } else {
        await db
          .update(postsTable)
          .set({ score: sql`${postsTable.score} + ${delta}` })
          .where(eq(postsTable.postId, oldVote.postId));
      }
    }
    return c.json({ vote: voteUpdateResult[0] }, 200);
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
  })
  .get("/comment/summary/:commentId", async (c) => {
    const commentId = assertIsParsableInt(c.req.param("commentId"));
    const { result, error } = await mightFail(
      db
        .select({
          upvotes: sql<number>`SUM(CASE WHEN ${votesTable.value} = 1 THEN 1 ELSE 0 END)`,
          downvotes: sql<number>`SUM(CASE WHEN ${votesTable.value} = -1 THEN 1 ELSE 0 END)`,
          score: sql<number>`COALESCE(SUM(${votesTable.value}), 0)`,
        })
        .from(votesTable)
        .where(eq(votesTable.commentId, commentId)),
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Error fetching comment vote summary",
        cause: error,
      });
    }
    return c.json(result[0] ?? { upvotes: 0, downvotes: 0, score: 0 });
  })
  .get("/comment/user/:commentId/:userId", async (c) => {
    const commentId = assertIsParsableInt(c.req.param("commentId"));
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
            eq(votesTable.commentId, commentId),
            eq(votesTable.userId, userId),
          ),
        )
        .limit(1),
    );
    if (error) {
      throw new HTTPException(500, {
        message: "Error fetching user comment vote",
        cause: error,
      });
    }
    return c.json({
      voted: result.length > 0,
      value: result[0]?.value ?? null,
      voteId: result[0]?.voteId ?? null,
    });
  });
