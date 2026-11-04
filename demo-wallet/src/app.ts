import { Hono, type Context } from "hono";
import { z } from "zod";
import { withTx, type Db, type Tx } from "./db.ts";
import { ApiError, invalid, notFound, ruleViolation } from "./errors.ts";
import { newId } from "./ids.ts";
import * as schemas from "./schemas.ts";

type Customer = { id: string; email: string; name: string; balance: number; created_at: Date };
type Product = { id: string; name: string; price: number; stock: number };
type PromoCode = { code: string; percent_off: number; active: boolean };
type Charge = {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  subtotal: number;
  discount: number;
  amount: number;
  refunded: number;
  promo_code: string | null;
  created_at: Date;
};

const customerJson = (c: Customer) => ({
  id: c.id,
  email: c.email,
  name: c.name,
  balance: c.balance,
  currency: "usd",
  created_at: c.created_at,
});

const chargeJson = (c: Charge) => ({
  id: c.id,
  customer: c.customer_id,
  product: c.product_id,
  quantity: c.quantity,
  subtotal: c.subtotal,
  discount: c.discount,
  amount: c.amount,
  refunded: c.refunded,
  promo_code: c.promo_code,
  currency: "usd",
  created_at: c.created_at,
});

async function body<T extends z.ZodType>(c: Context, schema: T): Promise<z.infer<T>> {
  const raw = await c.req.json().catch(() => {
    throw invalid("The request body must be JSON.");
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw invalid(`${issue?.path.join(".") || "body"}: ${issue?.message ?? "invalid"}`);
  }
  return parsed.data;
}

/** SELECT … FOR UPDATE on one row, or a 404. */
async function lockRow<T>(tx: Tx, sql: string, id: string, what: string): Promise<T> {
  const { rows } = await tx.query(`${sql} FOR UPDATE`, [id]);
  if (!rows[0]) throw notFound(what, id);
  return rows[0] as T;
}

const lockCustomer = (tx: Tx, id: string) => lockRow<Customer>(tx, "SELECT * FROM customers WHERE id = $1", id, "customer");

async function addLedgerEntry(tx: Tx, customerId: string, kind: string, amount: number, reference: string | null) {
  await tx.query("INSERT INTO ledger_entries (customer_id, kind, amount, reference) VALUES ($1, $2, $3, $4)", [
    customerId,
    kind,
    amount,
    reference,
  ]);
}

export function createApp(db: Db) {
  const app = new Hono();

  app.onError((error, c) => {
    if (error instanceof ApiError) {
      return c.json({ error: { code: error.code, message: error.message } }, error.status);
    }
    console.error(error);
    return c.json({ error: { code: "internal_error", message: "Something went wrong. Try again." } }, 500);
  });

  app.notFound((c) => c.json({ error: { code: "not_found", message: `No route for ${c.req.method} ${c.req.path}.` } }, 404));

  app.get("/health", async (c) => {
    await db.query("SELECT 1");
    return c.json({ status: "ok" });
  });

  // ---- Customers and wallets ----

  app.post("/customers", async (c) => {
    const input = await body(c, schemas.createCustomer);
    const { rows } = await db.query<Customer>(
      "INSERT INTO customers (id, email, name) VALUES ($1, lower($2), $3) ON CONFLICT (email) DO NOTHING RETURNING *",
      [newId("cus"), input.email, input.name],
    );
    if (!rows[0]) throw new ApiError(409, "email_taken", "A customer with this email already exists.");
    return c.json(customerJson(rows[0]), 201);
  });

  app.get("/customers/:id", async (c) => {
    const { rows } = await db.query<Customer>("SELECT * FROM customers WHERE id = $1", [c.req.param("id")]);
    if (!rows[0]) throw notFound("customer", c.req.param("id"));
    return c.json(customerJson(rows[0]));
  });

  app.post("/customers/:id/deposits", async (c) => {
    const { amount } = await body(c, schemas.moneyMovement);
    const customer = await withTx(db, async (tx) => {
      const current = await lockCustomer(tx, c.req.param("id"));
      const { rows } = await tx.query<Customer>("UPDATE customers SET balance = balance + $2 WHERE id = $1 RETURNING *", [
        current.id,
        amount,
      ]);
      await addLedgerEntry(tx, current.id, "deposit", amount, null);
      return rows[0]!;
    });
    return c.json(customerJson(customer), 201);
  });

  // Rule 1: a wallet balance can never go below $0.
  app.post("/customers/:id/withdrawals", async (c) => {
    const { amount } = await body(c, schemas.moneyMovement);
    const customer = await withTx(db, async (tx) => {
      const current = await lockCustomer(tx, c.req.param("id"));
      if (current.balance < amount) {
        throw ruleViolation("insufficient_funds", `The balance is ${current.balance} cents, less than ${amount} cents.`);
      }
      const { rows } = await tx.query<Customer>("UPDATE customers SET balance = balance - $2 WHERE id = $1 RETURNING *", [
        current.id,
        amount,
      ]);
      await addLedgerEntry(tx, current.id, "withdrawal", -amount, null);
      return rows[0]!;
    });
    return c.json(customerJson(customer), 201);
  });

  // ---- Catalog ----

  app.get("/products", async (c) => {
    const { rows } = await db.query<Product>("SELECT id, name, price, stock FROM products ORDER BY name");
    return c.json({ data: rows.map((p) => ({ ...p, currency: "usd" })) });
  });

  // ---- Charges (checkout) ----

  // Rules 1, 2 and 4. Lock order is always product -> promo code -> customer, so checkouts never deadlock.
  app.post("/charges", async (c) => {
    const input = await body(c, schemas.createCharge);
    const charge = await withTx(db, async (tx) => {
      // Rule 4: stock can never go below zero.
      const product = await lockRow<Product>(tx, "SELECT * FROM products WHERE id = $1", input.product, "product");
      if (product.stock < input.quantity) {
        throw ruleViolation("out_of_stock", `Only ${product.stock} left of ${product.name}.`);
      }

      const subtotal = product.price * input.quantity;
      let discount = 0;

      // Rule 2: a promo code works once per customer.
      if (input.promo_code) {
        const code = input.promo_code.toUpperCase();
        const { rows } = await tx.query<PromoCode>("SELECT * FROM promo_codes WHERE code = $1 FOR UPDATE", [code]);
        const promo = rows[0];
        if (!promo || !promo.active) throw invalid(`The promo code ${code} is not valid.`);
        const used = await tx.query("SELECT 1 FROM promo_redemptions WHERE code = $1 AND customer_id = $2 LIMIT 1", [
          code,
          input.customer,
        ]);
        if (used.rowCount) throw ruleViolation("promo_code_already_used", `This customer already used ${code}.`);
        discount = Math.floor((subtotal * promo.percent_off) / 100);
        input.promo_code = code;
      }

      // Rule 1: a wallet balance can never go below $0.
      const customer = await lockCustomer(tx, input.customer);
      const amount = subtotal - discount;
      if (customer.balance < amount) {
        throw ruleViolation("insufficient_funds", `The balance is ${customer.balance} cents, less than ${amount} cents.`);
      }

      const id = newId("ch");
      await tx.query("UPDATE products SET stock = stock - $2 WHERE id = $1", [product.id, input.quantity]);
      await tx.query("UPDATE customers SET balance = balance - $2 WHERE id = $1", [customer.id, amount]);
      const { rows } = await tx.query<Charge>(
        `INSERT INTO charges (id, customer_id, product_id, quantity, subtotal, discount, amount, promo_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [id, customer.id, product.id, input.quantity, subtotal, discount, amount, input.promo_code ?? null],
      );
      if (input.promo_code) {
        await tx.query("INSERT INTO promo_redemptions (code, customer_id, charge_id) VALUES ($1, $2, $3)", [
          input.promo_code,
          customer.id,
          id,
        ]);
      }
      await addLedgerEntry(tx, customer.id, "charge", -amount, id);
      return rows[0]!;
    });
    return c.json(chargeJson(charge), 201);
  });

  app.get("/charges/:id", async (c) => {
    const { rows } = await db.query<Charge>("SELECT * FROM charges WHERE id = $1", [c.req.param("id")]);
    if (!rows[0]) throw notFound("charge", c.req.param("id"));
    return c.json(chargeJson(rows[0]));
  });

  // ---- Refunds ----

  /**
   * What is still refundable on a charge, so a refund can be split into several partial payments.
   * Locks the charge row, so concurrent refunds on one charge are serialised and each sees the
   * other's `refunded` total. Call it inside the transaction that writes the refund.
   */
  async function refundable(tx: Tx, chargeId: string) {
    const charge = await lockRow<Charge>(tx, "SELECT * FROM charges WHERE id = $1", chargeId, "charge");
    return { charge, remaining: charge.amount - charge.refunded };
  }

  // Rule 3: a refund can never be more than the original charge (all refunds on a charge combined).
  // Refunds can be split into partial payments; without an amount, the remaining balance is refunded.
  app.post("/refunds", async (c) => {
    const input = await body(c, schemas.createRefund);
    const refund = await withTx(db, async (tx) => {
      const { charge, remaining } = await refundable(tx, input.charge);
      const amount = input.amount ?? remaining;
      if (amount <= 0 || amount > remaining) {
        throw ruleViolation(
          "refund_exceeds_charge",
          `This charge is ${charge.amount} cents and ${charge.refunded} cents are already refunded.`,
        );
      }
      const id = newId("re");
      await tx.query("UPDATE charges SET refunded = refunded + $2 WHERE id = $1", [charge.id, amount]);
      await tx.query("UPDATE customers SET balance = balance + $2 WHERE id = $1", [charge.customer_id, amount]);
      const { rows } = await tx.query<{ id: string; charge_id: string; amount: number; created_at: Date }>(
        "INSERT INTO refunds (id, charge_id, amount) VALUES ($1, $2, $3) RETURNING *",
        [id, charge.id, amount],
      );
      await addLedgerEntry(tx, charge.customer_id, "refund", amount, id);
      return rows[0]!;
    });
    return c.json(
      { id: refund.id, charge: refund.charge_id, amount: refund.amount, currency: "usd", created_at: refund.created_at },
      201,
    );
  });

  return app;
}
