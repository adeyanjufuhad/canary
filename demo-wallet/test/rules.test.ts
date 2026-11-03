import assert from "node:assert/strict";
import { after, before, describe, test } from "node:test";
import type { Db } from "../src/db.ts";
import { client, makeCustomer, makeProduct, makePromo, race, resetSchema, testDb } from "./helpers.ts";

let db: Db;
let api: ReturnType<typeof client>;

before(async () => {
  db = testDb();
  await resetSchema(db);
  api = client(db);
});

after(() => db.end());

const count = (results: { status: number }[], status: number) => results.filter((r) => r.status === status).length;

describe("Rule 1: a wallet balance can never go below $0", () => {
  test("a withdrawal larger than the balance is rejected", async () => {
    const customer = await makeCustomer(api, 10_000);
    const res = await api.post(`/customers/${customer}/withdrawals`, { amount: 10_001 });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "insufficient_funds");
    assert.equal((await api.get(`/customers/${customer}`)).body.balance, 10_000);
  });

  test("race: 10 withdrawals of the full balance at once, only 1 succeeds", async () => {
    const customer = await makeCustomer(api, 10_000);
    const results = await race(db, 10, () => api.post(`/customers/${customer}/withdrawals`, { amount: 10_000 }));
    assert.equal(count(results, 201), 1);
    assert.equal(count(results, 409), 9);
    assert.equal((await api.get(`/customers/${customer}`)).body.balance, 0);
  });

  test("a charge larger than the balance is rejected", async () => {
    const customer = await makeCustomer(api, 5_000);
    const product = await makeProduct(db, 8_500, 10);
    const res = await api.post("/charges", { customer, product });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "insufficient_funds");
  });
});

describe("Rule 2: a promo code works once per customer", () => {
  test("the second use by the same customer is rejected", async () => {
    const customer = await makeCustomer(api, 100_000);
    const product = await makeProduct(db, 10_000, 10);
    const code = await makePromo(db, 25);
    const first = await api.post("/charges", { customer, product, promo_code: code });
    assert.equal(first.status, 201);
    assert.equal(first.body.discount, 2_500);
    assert.equal(first.body.amount, 7_500);
    const second = await api.post("/charges", { customer, product, promo_code: code.toLowerCase() });
    assert.equal(second.status, 409);
    assert.equal(second.body.error.code, "promo_code_already_used");
  });

  test("a different customer can still use the code", async () => {
    const product = await makeProduct(db, 10_000, 10);
    const code = await makePromo(db, 10);
    for (const balance of [50_000, 50_000]) {
      const customer = await makeCustomer(api, balance);
      assert.equal((await api.post("/charges", { customer, product, promo_code: code })).status, 201);
    }
  });

  test("race: 5 checkouts with the same code at once, only 1 gets the discount", async () => {
    const customer = await makeCustomer(api, 100_000);
    const product = await makeProduct(db, 10_000, 10);
    const code = await makePromo(db, 50);
    const results = await race(db, 5, () => api.post("/charges", { customer, product, promo_code: code }));
    assert.equal(count(results, 201), 1);
    assert.equal(count(results, 409), 4);
  });
});

describe("Rule 3: a refund can never be more than the original charge", () => {
  test("partial refunds may add up to the charge, but never past it", async () => {
    const customer = await makeCustomer(api, 150_000);
    const product = await makeProduct(db, 150_000, 5);
    const charge = (await api.post("/charges", { customer, product })).body.id;
    assert.equal((await api.post("/refunds", { charge, amount: 100_000 })).status, 201);
    const tooMuch = await api.post("/refunds", { charge, amount: 60_000 });
    assert.equal(tooMuch.status, 409);
    assert.equal(tooMuch.body.error.code, "refund_exceeds_charge");
    assert.equal((await api.post("/refunds", { charge, amount: 50_000 })).status, 201);
    assert.equal((await api.get(`/charges/${charge}`)).body.refunded, 150_000);
  });

  // Red's PR #42 exploit sends 3 refunds; 10 makes sure the requests really overlap on every run.
  test("race: 10 full refunds of one $1,500 charge at once, only 1 succeeds (the PR #42 exploit)", async () => {
    const customer = await makeCustomer(api, 150_000);
    const product = await makeProduct(db, 150_000, 5);
    const charge = (await api.post("/charges", { customer, product })).body.id;
    const results = await race(db, 10, () => api.post("/refunds", { charge, amount: 150_000 }));
    assert.equal(count(results, 201), 1);
    assert.equal(count(results, 409), 9);
    assert.equal((await api.get(`/charges/${charge}`)).body.refunded, 150_000);
    assert.equal((await api.get(`/customers/${customer}`)).body.balance, 150_000);
  });

  // PR #8 made `amount` optional: left out, a refund pays whatever is still refundable. Red's exploit
  // raced that read of the remaining balance, so race the split-refund paths the PR added as well.
  test("race: 10 refunds with no amount at once, only 1 succeeds (the PR #8 exploit)", async () => {
    const customer = await makeCustomer(api, 150_000);
    const product = await makeProduct(db, 150_000, 5);
    const charge = (await api.post("/charges", { customer, product })).body.id;
    const results = await race(db, 10, () => api.post("/refunds", { charge }));
    assert.equal(count(results, 201), 1);
    assert.equal(count(results, 409), 9);
    assert.equal((await api.get(`/charges/${charge}`)).body.refunded, 150_000);
    assert.equal((await api.get(`/customers/${customer}`)).body.balance, 150_000);
  });

  test("race: 10 partial refunds of $200 on a $1,500 charge at once, only 7 fit", async () => {
    const customer = await makeCustomer(api, 150_000);
    const product = await makeProduct(db, 150_000, 5);
    const charge = (await api.post("/charges", { customer, product })).body.id;
    const results = await race(db, 10, () => api.post("/refunds", { charge, amount: 20_000 }));
    assert.equal(count(results, 201), 7);
    assert.equal(count(results, 409), 3);
    assert.equal((await api.get(`/charges/${charge}`)).body.refunded, 140_000);
    assert.equal((await api.get(`/customers/${customer}`)).body.balance, 140_000);
  });
});

describe("Rule 4: stock can never go below zero", () => {
  test("buying more than the stock is rejected", async () => {
    const customer = await makeCustomer(api, 100_000);
    const product = await makeProduct(db, 1_000, 2);
    const res = await api.post("/charges", { customer, product, quantity: 3 });
    assert.equal(res.status, 409);
    assert.equal(res.body.error.code, "out_of_stock");
  });

  test("race: 10 customers buy the last item at once, only 1 gets it", async () => {
    const product = await makeProduct(db, 8_500, 1);
    const customers = await Promise.all(Array.from({ length: 10 }, () => makeCustomer(api, 10_000)));
    const results = await race(db, customers.length, (i) => api.post("/charges", { customer: customers[i], product }));
    assert.equal(count(results, 201), 1);
    assert.equal(count(results, 409), 9);
    const { rows } = await db.query("SELECT stock FROM products WHERE id = $1", [product]);
    assert.equal(rows[0].stock, 0);
  });
});

describe("Requests and errors", () => {
  test("health check", async () => {
    assert.deepEqual((await api.get("/health")).body, { status: "ok" });
  });

  test("amounts must be positive integer cents", async () => {
    const customer = await makeCustomer(api);
    for (const amount of [-100, 0, 10.5, "1000"]) {
      const res = await api.post(`/customers/${customer}/deposits`, { amount });
      assert.equal(res.status, 400, `amount ${JSON.stringify(amount)}`);
      assert.equal(res.body.error.code, "invalid_request");
    }
  });

  test("unknown ids return 404", async () => {
    assert.equal((await api.get("/customers/cus_missing")).status, 404);
    assert.equal((await api.post("/refunds", { charge: "ch_missing", amount: 100 })).status, 404);
  });

  test("every balance change is in the ledger", async () => {
    const customer = await makeCustomer(api, 20_000);
    await api.post(`/customers/${customer}/withdrawals`, { amount: 5_000 });
    const { rows } = await db.query("SELECT kind, amount FROM ledger_entries WHERE customer_id = $1 ORDER BY id", [customer]);
    assert.deepEqual(rows, [
      { kind: "deposit", amount: 20_000 },
      { kind: "withdrawal", amount: -5_000 },
    ]);
  });
});
