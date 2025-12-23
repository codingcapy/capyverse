import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { communities as communitiesTable } from "../schemas/communities";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";

export const communitiesRouter = new Hono()
  .post(
    "/",
    zValidator(
      "json",
      createInsertSchema(communitiesTable).omit({
        communityId: true,
        status: true,
        createdAt: true,
      })
    ),
    async (c) => {
      const insertValues = c.req.valid("json");
      const { error: communityInsertError, result: communityInsertResult } =
        await mightFail(
          db.insert(communitiesTable).values(insertValues).returning()
        );
      if (communityInsertError) {
        console.log("Error while creating community");
        console.log(communityInsertError);
        throw new HTTPException(500, {
          message: "Error while creating community",
          cause: communityInsertError,
        });
      }
      return c.json({ communityResult: communityInsertResult[0] }, 200);
    }
  )
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
  });
