import { Hono, type Context } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { serve } from "@hono/node-server";
import { usersRouter } from "./routes/users";
import { userRouter } from "./routes/user";
import { postsRouter } from "./routes/posts";
import { commentsRouter } from "./routes/comments";
import { votesRouter } from "./routes/votes";
import { imagesRouter } from "./routes/images";
import { communitiesRouter } from "./routes/communities";
import { compress } from "hono/compress";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";

const getClientIp = (c: Context) =>
  c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
  c.req.header("x-real-ip") ??
  "unknown";

const app = new Hono();

app.use("*", logger());
app.use("*", compress());
app.use("*", secureHeaders());

// Rate limit login: 20 attempts per 15 minutes per IP
app.use(
  "/api/v0/user/login",
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    keyGenerator: getClientIp,
  }),
);

// Rate limit signup: 10 accounts per hour per IP
app.use(
  "/api/v0/users",
  rateLimiter({
    windowMs: 60 * 60 * 1000,
    limit: 10,
    keyGenerator: getClientIp,
  }),
);

app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "https://capyverse.up.railway.app"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

const PORT = parseInt(process.env.PORT!) || 3333;

const apiRoutes = app
  .basePath("/api/v0")
  .route("/users", usersRouter)
  .route("/user", userRouter)
  .route("/posts", postsRouter)
  .route("/votes", votesRouter)
  .route("/comments", commentsRouter)
  .route("/images", imagesRouter)
  .route("/communities", communitiesRouter);

export type ApiRoutes = typeof apiRoutes;
export default app;

app.use("/*", serveStatic({ root: "./frontend/dist" }));
app.get("/*", async (c) => {
  try {
    const indexHtml = await Bun.file("./frontend/dist/index.html").text();
    return c.html(indexHtml);
  } catch (error) {
    console.error("Error reading index.html:", error);
    return c.text("Internal Server Error", 500);
  }
});

const server = serve({
  port: PORT,
  fetch: app.fetch,
});
console.log("Server running on port", PORT);
