import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { communities as communitiesTable } from "../schemas/communities";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";
import { assertIsParsableInt } from "./posts";
import { eq } from "drizzle-orm";
import { communityUsers as communityUsersTable } from "../schemas/communityusers";
import z from "zod";

const createCommunitySchema = z.object({
  communityId: z.string(),
  userId: z.string(),
  description: z.string(),
  category: z.string().optional(),
  visibility: z.string().optional(),
  mature: z.boolean().optional(),
  icon: z.string().optional(),
  banner: z.string().optional(),
});

export const communitiesRouter = new Hono()
  .post("/", zValidator("json", createCommunitySchema), async (c) => {
    const insertValues = c.req.valid("json");
    const { result: communitiesQueryResult, error: communitiesQueryError } =
      await mightFail(
        db
          .select()
          .from(communitiesTable)
          .where(eq(communitiesTable.communityId, insertValues.communityId))
      );
    if (communitiesQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching community",
        cause: communitiesQueryError,
      });
    }
    if (communitiesQueryResult.length > 0)
      throw new HTTPException(401, {
        message: "Community ID already exists",
        cause: Error(),
      });
    const { error: communityInsertError, result: communityInsertResult } =
      await mightFail(
        db
          .insert(communitiesTable)
          .values({
            communityId: insertValues.communityId,
            description: insertValues.description,
            category: insertValues.category,
            visibility: insertValues.visibility,
            mature: insertValues.mature,
            icon: insertValues.icon,
            banner: insertValues.banner,
          })
          .returning()
      );
    if (communityInsertError) {
      console.log("Error while creating community");
      console.log(communityInsertError);
      throw new HTTPException(500, {
        message: "Error while creating community",
        cause: communityInsertError,
      });
    }
    const {
      error: communityUserInsertError,
      result: communityUserInsertResult,
    } = await mightFail(
      db
        .insert(communityUsersTable)
        .values({
          userId: insertValues.userId,
          communityId: insertValues.communityId,
          role: "moderator",
        })
        .returning()
    );
    if (communityUserInsertError) {
      console.log("Error while creating community user");
      console.log(communityUserInsertResult);
      throw new HTTPException(500, {
        message: "Error while creating community user",
        cause: communityUserInsertResult,
      });
    }
    return c.json({ communityResult: communityInsertResult[0] }, 200);
  })
  .get("/", async (c) => {
    const { result: communitiesQueryResult, error: communitiesQueryError } =
      await mightFail(db.select().from(communitiesTable));
    if (communitiesQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching communities",
        cause: communitiesQueryError,
      });
    }
    return c.json({
      communities: communitiesQueryResult,
    });
  })
  .get("/:communityId", async (c) => {
    const { communityId } = c.req.param();
    const { result: communitiesQueryResult, error: communitiesQueryError } =
      await mightFail(
        db
          .select()
          .from(communitiesTable)
          .where(eq(communitiesTable.communityId, communityId))
      );
    if (communitiesQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching community",
        cause: communitiesQueryError,
      });
    }
    return c.json({
      community: communitiesQueryResult[0],
    });
  });
