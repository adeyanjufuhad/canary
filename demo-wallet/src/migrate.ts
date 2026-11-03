import { readFile } from "node:fs/promises";
import { createPool } from "./db.ts";

/** Applies db/schema.sql and db/seed.sql. With --reset, drops this app's tables first. */
const TABLES = ["ledger_entries", "refunds", "promo_redemptions", "charges", "promo_codes", "products", "customers"];

const db = createPool(process.env.DATABASE_URL);
const reset = process.argv.includes("--reset");
const file = (name: string) => readFile(new URL(`../db/${name}`, import.meta.url), "utf8");

try {
  if (reset) {
    await db.query(`DROP TABLE IF EXISTS ${TABLES.join(", ")} CASCADE`);
    console.log("dropped demo-wallet tables");
  }
  await db.query(await file("schema.sql"));
  await db.query(await file("seed.sql"));
  console.log("schema and seed data applied");
} finally {
  await db.end();
}
