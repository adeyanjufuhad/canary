-- Demo catalog. Prices are integer cents (USD).
INSERT INTO products (id, name, price, stock) VALUES
  ('prod_headphones', 'Studio headphones', 24900, 25),
  ('prod_keyboard', 'Mechanical keyboard', 13900, 40),
  ('prod_annual', 'Annual Pro plan', 150000, 1000),
  ('prod_print', 'Limited edition print', 8500, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO promo_codes (code, percent_off) VALUES
  ('WELCOME10', 10),
  ('LAUNCH25', 25)
ON CONFLICT (code) DO NOTHING;
