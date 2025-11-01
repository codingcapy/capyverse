import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

const PORT = parseInt(process.env.PORT!) || 3333;

const apiRoutes = app.basePath("/api/v0");

export type ApiRoutes = typeof apiRoutes;
export default app;

const server = serve({
  port: PORT,
  fetch: app.fetch,
});
console.log("Server running on port", PORT);
