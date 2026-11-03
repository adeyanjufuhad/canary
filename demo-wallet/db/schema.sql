-- Demo wallet schema. Money is always integer cents (USD).
--
-- On purpose, there are NO constraints for the business rules in RULES.md
-- (balance >= 0, one promo use per customer, refunds <= charge, stock >= 0).
-- The API enforces them, so a pull request that breaks the code really breaks the rule.

CREATE TABLE IF NOT EXISTS customers (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  balance bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  name text NOT NULL,
  price bigint NOT NULL CHECK (price > 0),
  stock integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_codes (
  code text PRIMARY KEY,
  percent_off integer NOT NULL CHECK (percent_off BETWEEN 1 AND 100),
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS charges (
  id text PRIMARY KEY,
  customer_id text NOT NULL REFERENCES customers (id),
  product_id text NOT NULL REFERENCES products (id),
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal bigint NOT NULL,
  discount bigint NOT NULL DEFAULT 0,
  amount bigint NOT NULL,
  refunded bigint NOT NULL DEFAULT 0,
  promo_code text REFERENCES promo_codes (code),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promo_redemptions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text NOT NULL REFERENCES promo_codes (code),
  customer_id text NOT NULL REFERENCES customers (id),
  charge_id text NOT NULL REFERENCES charges (id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS promo_redemptions_code_customer ON promo_redemptions (code, customer_id);

CREATE TABLE IF NOT EXISTS refunds (
  id text PRIMARY KEY,
  charge_id text NOT NULL REFERENCES charges (id),
  amount bigint NOT NULL CHECK (amount > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Every balance change, for audits and for Canary's evidence.
CREATE TABLE IF NOT EXISTS ledger_entries (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_id text NOT NULL REFERENCES customers (id),
  kind text NOT NULL CHECK (kind IN ('deposit', 'withdrawal', 'charge', 'refund')),
  amount bigint NOT NULL, -- signed: money in is positive, money out is negative
  reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);
