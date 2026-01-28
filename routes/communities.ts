import { zValidator } from "@hono/zod-validator";
import { createInsertSchema } from "drizzle-zod";
import { Hono } from "hono";
import { communities as communitiesTable } from "../schemas/communities";
import { mightFail } from "might-fail";
import { db } from "../db";
import { HTTPException } from "hono/http-exception";
import { assertIsParsableInt, requireUser } from "./posts";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { communityUsers as communityUsersTable } from "../schemas/communityusers";
import z from "zod";

const createCommunitySchema = z.object({
  communityId: z.string(),
  description: z.string(),
  category: z.string().optional(),
  visibility: z.string().optional(),
  mature: z.boolean().optional(),
  icon: z.string().optional(),
  banner: z.string().optional(),
});

const updateIconSchema = z.object({
  communityId: z.string(),
  icon: z.string(),
});

const updateDescriptionSchema = z.object({
  communityId: z.string(),
  description: z.string(),
});

const updateSettingsSchema = z.object({
  communityId: z.string(),
  description: z.string(),
  visibility: z.string(),
  mature: z.boolean(),
});

const joinCommunitySchema = z.object({
  communityId: z.string(),
});

export const communitiesRouter = new Hono()
  .post("/", zValidator("json", createCommunitySchema), async (c) => {
    const decodedUser = requireUser(c);
    const insertValues = c.req.valid("json");
    const { result: communitiesQueryResult, error: communitiesQueryError } =
      await mightFail(
        db
          .select()
          .from(communitiesTable)
          .where(eq(communitiesTable.communityId, insertValues.communityId)),
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
          .returning(),
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
          userId: decodedUser.id,
          communityId: insertValues.communityId,
          role: "moderator",
        })
        .returning(),
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
    const PAGE_SIZE = 250;
    const page = Math.max(Number(c.req.query("page") ?? 1), 1);
    const offset = (page - 1) * PAGE_SIZE;
    const { result: communities, error: communitiesError } = await mightFail(
      db
        .select()
        .from(communitiesTable)
        .orderBy(asc(communitiesTable.communityId))
        .limit(PAGE_SIZE)
        .offset(offset),
    );
    if (communitiesError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching communities",
        cause: communitiesError,
      });
    }
    const { result: countResult, error: countError } = await mightFail(
      db
        .select({
          count: sql<number>`count(*)`,
        })
        .from(communitiesTable),
    );
    if (countError) {
      throw new HTTPException(500, {
        message: "Error occurred when counting communities",
        cause: countError,
      });
    }
    if (!countResult || countResult.length === 0) {
      throw new HTTPException(500, {
        message: "Failed to count communities",
      });
    }
    //@ts-ignore
    const total = Number(countResult[0].count);
    const totalPages = Math.ceil(total / PAGE_SIZE);
    return c.json({
      communities,
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages,
    });
  })
  .get("/user/:userId", async (c) => {
    const userId = c.req.param("userId");
    const { result: userCommunitiesResult, error: suserCommunitiesError } =
      await mightFail(
        db
          .select({
            communityId: communitiesTable.communityId,
            icon: communitiesTable.icon,
            description: communitiesTable.description,
            status: communitiesTable.status,
            createdAt: communitiesTable.createdAt,
          })
          .from(communityUsersTable)
          .innerJoin(
            communitiesTable,
            eq(communityUsersTable.communityId, communitiesTable.communityId),
          )
          .where(eq(communityUsersTable.userId, userId))
          .orderBy(desc(communityUsersTable.createdAt)),
      );
    if (suserCommunitiesError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching saved posts",
        cause: suserCommunitiesError,
      });
    }
    return c.json({
      communities: userCommunitiesResult,
    });
  })
  .get("/moderators/:communityId", async (c) => {
    const { communityId } = c.req.param();
    const { result: moderatorsQueryResult, error: moderatorsQueryError } =
      await mightFail(
        db
          .select()
          .from(communityUsersTable)
          .where(
            and(
              eq(communityUsersTable.communityId, communityId),
              eq(communityUsersTable.role, "moderator"),
            ),
          ),
      );
    if (moderatorsQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching moderators",
        cause: moderatorsQueryError,
      });
    }
    return c.json({
      moderators: moderatorsQueryResult,
    });
  })
  .get("/:communityId", async (c) => {
    const { communityId } = c.req.param();
    const { result: communitiesQueryResult, error: communitiesQueryError } =
      await mightFail(
        db
          .select()
          .from(communitiesTable)
          .where(eq(communitiesTable.communityId, communityId)),
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
  })
  .post("/update/icon", zValidator("json", updateIconSchema), async (c) => {
    const decodedUser = requireUser(c);
    const updateValues = c.req.valid("json");
    const { error: queryError, result: newCommunityResult } = await mightFail(
      db
        .update(communitiesTable)
        .set({ icon: updateValues.icon })
        .where(eq(communitiesTable.communityId, updateValues.communityId))
        .returning(),
    );
    if (queryError) {
      throw new HTTPException(500, {
        message: "Error updating communities table",
        cause: queryError,
      });
    }
    return c.json({ newCommunity: newCommunityResult[0] }, 200);
  })
  .post(
    "/update/description",
    zValidator("json", updateDescriptionSchema),
    async (c) => {
      const decodedUser = requireUser(c);
      const updateValues = c.req.valid("json");
      const { error: queryError, result: newCommunityResult } = await mightFail(
        db
          .update(communitiesTable)
          .set({ description: updateValues.description })
          .where(eq(communitiesTable.communityId, updateValues.communityId))
          .returning(),
      );
      if (queryError) {
        throw new HTTPException(500, {
          message: "Error updating communities table",
          cause: queryError,
        });
      }
      return c.json({ newCommunity: newCommunityResult[0] }, 200);
    },
  )
  .post(
    "/update/settings",
    zValidator("json", updateSettingsSchema),
    async (c) => {
      const decodedUser = requireUser(c);
      const updateValues = c.req.valid("json");
      const { error: queryError, result: newCommunityResult } = await mightFail(
        db
          .update(communitiesTable)
          .set({
            description: updateValues.description,
            visibility: updateValues.visibility,
            mature: updateValues.mature,
          })
          .where(eq(communitiesTable.communityId, updateValues.communityId))
          .returning(),
      );
      if (queryError) {
        throw new HTTPException(500, {
          message: "Error updating communities table",
          cause: queryError,
        });
      }
      return c.json({ newCommunity: newCommunityResult[0] }, 200);
    },
  )
  .post("/join", zValidator("json", joinCommunitySchema), async (c) => {
    const decodedUser = requireUser(c);
    const insertValues = c.req.valid("json");
    const { result: communitiesQueryResult, error: communitiesQueryError } =
      await mightFail(
        db
          .select()
          .from(communityUsersTable)
          .where(
            and(
              eq(communityUsersTable.communityId, insertValues.communityId),
              eq(communityUsersTable.userId, decodedUser.id),
            ),
          ),
      );
    if (communitiesQueryError) {
      throw new HTTPException(500, {
        message: "Error occurred when fetching community user",
        cause: communitiesQueryError,
      });
    }
    if (communitiesQueryResult.length > 0)
      throw new HTTPException(401, {
        message: "User is already in community",
        cause: Error(),
      });
    const {
      error: communityUserInsertError,
      result: communityUserInsertResult,
    } = await mightFail(
      db
        .insert(communityUsersTable)
        .values({ ...insertValues, userId: decodedUser.id })
        .returning(),
    );
    if (communityUserInsertError) {
      console.log("Error while creating community user");
      console.log(communityUserInsertResult);
      throw new HTTPException(500, {
        message: "Error while creating community user",
        cause: communityUserInsertResult,
      });
    }
    return c.json({ communityResult: communityUserInsertResult[0] }, 200);
  })
  .post("/leave", zValidator("json", joinCommunitySchema), async (c) => {
    const decodedUser = requireUser(c);
    const insertValues = c.req.valid("json");
    const {
      error: communityUserDeleteError,
      result: communityUserDeleteResult,
    } = await mightFail(
      db
        .delete(communityUsersTable)
        .where(
          and(
            eq(communityUsersTable.communityId, insertValues.communityId),
            eq(communityUsersTable.userId, decodedUser.id),
          ),
        )
        .returning(),
    );
    if (communityUserDeleteError) {
      console.log("Error while creating community user");
      console.log(communityUserDeleteError);
      throw new HTTPException(500, {
        message: "Error while creating community user",
        cause: communityUserDeleteError,
      });
    }
    return c.json({ communityResult: communityUserDeleteResult[0] }, 200);
  });
