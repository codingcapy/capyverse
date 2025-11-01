import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serveStatic } from "hono/bun";
import { serve } from "@hono/node-server";
import { usersRouter } from "./routes/users";
import { userRouter } from "./routes/user";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

const PORT = parseInt(process.env.PORT!) || 3333;

const apiRoutes = app
  .basePath("/api/v0")
  .route("/users", usersRouter)
  .route("/user", userRouter);

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
