-- ================================================
-- WhatsApp Bot Sessions Table
-- ================================================
-- Ejecutar en Supabase SQL Editor
-- Esta tabla almacena el estado de conversación de cada usuario de WhatsApp

CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  phone TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'MAIN_MENU',
  cart JSONB NOT NULL DEFAULT '[]'::jsonb,
  session_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice para limpiar sesiones expiradas
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_last_activity 
  ON whatsapp_sessions(last_activity);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_whatsapp_session_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS whatsapp_session_updated ON whatsapp_sessions;
CREATE TRIGGER whatsapp_session_updated
  BEFORE UPDATE ON whatsapp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_whatsapp_session_timestamp();

-- Habilitar RLS pero permitir que el service role acceda
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- Política: solo el service role puede acceder (backend)
CREATE POLICY "Service role full access" ON whatsapp_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- (Opcional) Limpiar sesiones inactivas por más de 24 horas
-- Se puede ejecutar manualmente o con un cron:
-- DELETE FROM whatsapp_sessions WHERE last_activity < NOW() - INTERVAL '24 hours';
