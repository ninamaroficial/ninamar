-- WhatsApp Messages History Table
-- Ejecutar este SQL en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  message_id TEXT UNIQUE,
  direction TEXT NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'button', 'list', 'interactive')),
  is_bot BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone_timestamp ON whatsapp_messages(phone, timestamp DESC);

-- Agregar columna mode a whatsapp_sessions si no existe
ALTER TABLE whatsapp_sessions 
ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'bot' CHECK (mode IN ('bot', 'manual'));

-- Agregar columna profile_picture_url a whatsapp_sessions si no existe
ALTER TABLE whatsapp_sessions 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Índice para buscar sesiones activas
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_last_activity ON whatsapp_sessions(last_activity DESC);

COMMENT ON TABLE whatsapp_messages IS 'Historial de mensajes de WhatsApp (enviados y recibidos)';
COMMENT ON COLUMN whatsapp_messages.direction IS 'incoming = mensaje del cliente, outgoing = mensaje enviado por nosotros';
COMMENT ON COLUMN whatsapp_messages.is_bot IS 'true = enviado por bot, false = enviado manualmente por admin';
COMMENT ON COLUMN whatsapp_sessions.mode IS 'bot = respuestas automáticas activas, manual = respuestas manuales únicamente';
