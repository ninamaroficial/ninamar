ALTER TABLE order_reviews
  ADD COLUMN IF NOT EXISTS product_rating INTEGER CHECK (product_rating >= 1 AND product_rating <= 5);

ALTER TABLE order_reviews
  ADD COLUMN IF NOT EXISTS delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5);