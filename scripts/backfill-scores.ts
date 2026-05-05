import { db } from "../db";
import { sql } from "drizzle-orm";

await db.execute(
  sql`UPDATE posts SET score = (
    SELECT COALESCE(SUM(v.value), 0) FROM votes v
    WHERE v.post_id = posts.post_id AND v.comment_id IS NULL
  )`,
);
console.log("Posts backfill complete");

await db.execute(
  sql`UPDATE comments SET score = (
    SELECT COALESCE(SUM(v.value), 0) FROM votes v
    WHERE v.comment_id = comments.comment_id
  )`,
);
console.log("Comments backfill complete");
