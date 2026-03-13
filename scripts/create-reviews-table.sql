-- Tabla para encuestas de satisfacción
CREATE TABLE IF NOT EXISTS order_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  customer_name TEXT,
  
  -- Calificación general (1-5 estrellas)
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Calificación del producto (1-5 estrellas)
  product_rating INTEGER CHECK (product_rating >= 1 AND product_rating <= 5),

  -- Calificación de la entrega (1-5 estrellas)
  delivery_rating INTEGER CHECK (delivery_rating >= 1 AND delivery_rating <= 5),
  
  -- Comentario opcional del cliente
  comment TEXT,
  
  -- ¿Recomendaría Niñamar? (sí/no)
  would_recommend BOOLEAN,
  
  -- Qué le gustó más (opcional)
  liked_most TEXT,
  
  -- Qué podemos mejorar (opcional)
  improvement_suggestion TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices
  UNIQUE(order_id)
);

-- Índice para búsquedas por teléfono
CREATE INDEX idx_reviews_phone ON order_reviews(customer_phone);

-- Índice para búsquedas por email
CREATE INDEX idx_reviews_email ON order_reviews(customer_email);

-- Índice para búsquedas por calificación
CREATE INDEX idx_reviews_rating ON order_reviews(rating);

-- Índice para orden por fecha
CREATE INDEX idx_reviews_created_at ON order_reviews(created_at DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON order_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Comentarios
COMMENT ON TABLE order_reviews IS 'Encuestas de satisfacción de clientes después de recibir su pedido';
COMMENT ON COLUMN order_reviews.rating IS 'Calificación de 1 a 5 estrellas';
COMMENT ON COLUMN order_reviews.would_recommend IS '¿Recomendaría Niñamar a otros?';
