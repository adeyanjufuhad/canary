import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createApp } from "../src/app.ts";
import { createPool, type Db } from "../src/db.ts";

/** Tests drop and recreate the app's tables, so point them at a database you can wipe. */
export function testDb(): Db {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("Set TEST_DATABASE_URL to a database the tests may wipe.");
  return createPool(url);
}

export async function resetSchema(db: Db) {
  const file = (name: string) => readFile(new URL(`../db/${name}`, import.meta.url), "utf8");
  await db.query(
    "DROP TABLE IF EXISTS ledger_entries, refunds, promo_redemptions, charges, promo_codes, products, customers CASCADE",
  );
  await db.query(await file("schema.sql"));
}

export function client(db: Db) {
  const app = createApp(db);
  const call = async (method: string, path: string, body?: unknown) => {
    const res = await app.request(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: res.status, body: (await res.json()) as Record<string, any> };
  };
  return {
    get: (path: string) => call("GET", path),
    post: (path: string, body?: unknown) => call("POST", path, body),
  };
}

const unique = () => randomUUID().slice(0, 8);

export async function makeCustomer(api: ReturnType<typeof client>, balance = 0) {
  const { body } = await api.post("/customers", { email: `test-${unique()}@example.com`, name: "Test Customer" });
  if (balance > 0) await api.post(`/customers/${body.id}/deposits`, { amount: balance });
  return body.id as string;
}

export async function makeProduct(db: Db, price: number, stock: number) {
  const id = `prod_test_${unique()}`;
  await db.query("INSERT INTO products (id, name, price, stock) VALUES ($1, $2, $3, $4)", [id, "Test product", price, stock]);
  return id;
}

export async function makePromo(db: Db, percentOff: number) {
  const code = `TEST${unique().toUpperCase()}`;
  await db.query("INSERT INTO promo_codes (code, percent_off) VALUES ($1, $2)", [code, percentOff]);
  return code;
}

/**
 * Opens n pool connections. Without this, racing requests wait for new connections one by one
 * and never really overlap, so a race test could pass on code that has the bug. The pool closes
 * connections after 10 s idle, so warm it right before each race, not once per file.
 */
async function warmPool(db: Db, n: number) {
  const conns = await Promise.all(Array.from({ length: n }, () => db.connect()));
  conns.forEach((conn) => conn.release());
}

/** Sends n requests at the same moment, like an attacker racing the API. */
export async function race<T>(db: Db, n: number, fn: (i: number) => Promise<T>): Promise<T[]> {
  await warmPool(db, n);
  return Promise.all(Array.from({ length: n }, (_, i) => fn(i)));
}
