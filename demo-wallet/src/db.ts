import pg from "pg";

const { Pool, types } = pg;

// bigint columns hold cents; every value here fits safely in a JS number
types.setTypeParser(types.builtins.INT8, (value) => {
  const n = Number(value);
  if (!Number.isSafeInteger(n)) throw new RangeError(`int8 out of safe range: ${value}`);
  return n;
});

export type Db = pg.Pool;
export type Tx = pg.PoolClient;

export function createPool(connectionString: string | undefined): Db {
  if (!connectionString) throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
  return new Pool({ connectionString, max: 20 });
}

/** Runs fn inside one transaction on one connection; rolls back if it throws. */
export async function withTx<T>(db: Db, fn: (tx: Tx) => Promise<T>): Promise<T> {
  const tx = await db.connect();
  try {
    await tx.query("BEGIN");
    const result = await fn(tx);
    await tx.query("COMMIT");
    return result;
  } catch (error) {
    await tx.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    tx.release();
  }
}
