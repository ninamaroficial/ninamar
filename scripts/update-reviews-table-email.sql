ALTER TABLE order_reviews
  ALTER COLUMN customer_phone DROP NOT NULL;

ALTER TABLE order_reviews
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

CREATE INDEX IF NOT EXISTS idx_reviews_email ON order_reviews(customer_email);