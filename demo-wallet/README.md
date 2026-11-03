# Demo wallet API

A small wallet and checkout API with real business rules. It is the app Canary's agents try to break in the demo.

Customers keep a balance in a wallet, buy products, use promo codes, and get refunds. Four rules must always hold, even under many simultaneous requests. They are listed in [RULES.md](RULES.md):

1. A wallet balance can never go below $0.
2. A promo code works once per customer.
3. A refund can never be more than the original charge.
4. Stock can never go below zero.

The API enforces each rule inside a database transaction, after locking the row the rule depends on. The database has no CHECK constraints for these rules on purpose: if a pull request removes a check from the code, the rule must really break, so Canary has something to catch.

Built with Node.js, [Hono](https://hono.dev), [node-postgres](https://node-postgres.com), and [Zod](https://zod.dev). Money is always **integer cents in USD**: `150000` means $1,500.00.

## Run it

### Without Docker

You need Node.js 20 or newer and a Postgres 14+ database. [Neon](https://neon.tech) has a free tier.

```bash
cd demo-wallet
npm install
cp .env.example .env    # then set DATABASE_URL
npm run db:setup        # creates the tables and demo data
npm run dev             # http://localhost:4000
```

### With Docker

From the repository root:

```bash
docker compose up --build
```

This starts Postgres 18 and the API on http://localhost:4000. The schema and demo data load on the first start. The values come from the root `.env` (`POSTGRES_*`, `DEMO_API_PORT`); without one, safe local defaults are used.

> The Docker files have not been run yet: they were written on a machine without Docker. Please report any problem.

## Tests

```bash
npm test
```

The tests need `TEST_DATABASE_URL`: a separate database they are allowed to wipe, because they drop and recreate the tables. For each rule there is a normal case and a **race attack**, where 5 or 10 requests hit the same row at the same moment.

The race tests are checked against broken code: with the row locks removed, all four race tests fail. That is the kind of bug Canary's Red agent looks for.

| Command | What it does |
|---|---|
| `npm run dev` | Start the API with reload on change |
| `npm run build` / `npm start` | Compile to `dist/` and run it |
| `npm run db:setup` | Create the tables (if missing) and insert the demo data |
| `npm run db:reset` | **Drop** this app's tables, then set them up again |
| `npm test` | Run the rule tests (wipes `TEST_DATABASE_URL`) |
| `npm run typecheck` | TypeScript check |

## API

All request and response bodies are JSON. Errors look like this:

```json
{ "error": { "code": "refund_exceeds_charge", "message": "This charge is 150000 cents and 150000 cents are already refunded." } }
```

| Status | Meaning |
|---|---|
| `201` | Created |
| `400` | Invalid request (`invalid_request`) |
| `404` | Unknown ID (`not_found`) |
| `409` | The request would break a rule, or the email is taken |

### Endpoints

| Method and path | Body | Rule |
|---|---|---|
| `GET /health` | | |
| `POST /customers` | `{ "email", "name" }` | |
| `GET /customers/:id` | | |
| `POST /customers/:id/deposits` | `{ "amount" }` | |
| `POST /customers/:id/withdrawals` | `{ "amount" }` | 1: `insufficient_funds` |
| `GET /products` | | |
| `POST /charges` | `{ "customer", "product", "quantity"?, "promo_code"? }` | 1: `insufficient_funds`, 2: `promo_code_already_used`, 4: `out_of_stock` |
| `GET /charges/:id` | | |
| `POST /refunds` | `{ "charge", "amount" }` | 3: `refund_exceeds_charge` |

`amount` is always positive integer cents, at most `100000000` ($1,000,000). `quantity` is 1 to 100 and defaults to 1. Promo codes are not case sensitive.

### Example

```bash
# A customer with $2,000 in their wallet
curl -s -X POST localhost:4000/customers -H 'Content-Type: application/json' \
  -d '{"email":"priya@example.com","name":"Priya Raman"}'
curl -s -X POST localhost:4000/customers/cus_…/deposits -H 'Content-Type: application/json' \
  -d '{"amount":200000}'

# Buy the Annual Pro plan ($1,500) with 10% off: the charge is $1,350
curl -s -X POST localhost:4000/charges -H 'Content-Type: application/json' \
  -d '{"customer":"cus_…","product":"prod_annual","promo_code":"WELCOME10"}'

# Refund part of it
curl -s -X POST localhost:4000/refunds -H 'Content-Type: application/json' \
  -d '{"charge":"ch_…","amount":50000}'
```

### Demo data

| Product | ID | Price | Stock |
|---|---|---|---|
| Studio headphones | `prod_headphones` | $249.00 | 25 |
| Mechanical keyboard | `prod_keyboard` | $139.00 | 40 |
| Annual Pro plan | `prod_annual` | $1,500.00 | 1,000 |
| Limited edition print | `prod_print` | $85.00 | 1 |

Promo codes: `WELCOME10` (10% off) and `LAUNCH25` (25% off).

## Layout

```text
demo-wallet/
├── src/app.ts       Routes and the four rule checks
├── src/db.ts        Connection pool and transaction helper
├── src/schemas.ts   Request validation (Zod)
├── src/migrate.ts   db:setup and db:reset
├── db/schema.sql    Tables (no rule constraints, on purpose)
├── db/seed.sql      Demo products and promo codes
├── test/            Rule tests and race attacks
└── RULES.md         The rules in plain English
```
