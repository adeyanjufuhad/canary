-- Waitlist sign-ups for the landing page (Neon project canary-web).
-- Applied once by hand; the API route only ever INSERTs.

CREATE TABLE waitlist (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email text NOT NULL CHECK (char_length(email) <= 254),
  source text NOT NULL DEFAULT 'landing',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- one row per address, whatever the letter case
CREATE UNIQUE INDEX waitlist_email_lower_key ON waitlist (lower(email));
