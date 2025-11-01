import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import dotenv from "dotenv";

dotenv.config();

const Pool = pg.Pool;

export const pool = new Pool({
  connectionString: process.env.LOCALCONNECTIONSTRING,
});

export const db = drizzle(pool);
