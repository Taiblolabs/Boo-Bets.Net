-- Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índice en wallet_address para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_profiles_wallet_address ON user_profiles(wallet_address);

-- Crear tabla de puntuaciones del juego
CREATE TABLE IF NOT EXISTS game_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  score INTEGER NOT NULL DEFAULT 0,
  moves INTEGER NOT NULL DEFAULT 0,
  time_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_game_scores_user_id ON game_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_game_scores_score ON game_scores(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_scores_completed ON game_scores(completed);

-- Crear tabla de tokens de usuario
CREATE TABLE IF NOT EXISTS user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id),
  amount INTEGER NOT NULL DEFAULT 0,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('reward', 'purchase', 'transfer')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índice para obtener todas las transacciones de un usuario
CREATE INDEX IF NOT EXISTS idx_user_tokens_user_id ON user_tokens(user_id);

-- Crear políticas de seguridad (RLS - Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;

-- Políticas para entorno de desarrollo y producción
-- Estas políticas permiten acceso público durante desarrollo
-- En producción, se requerirá configurar JWT personalizado con Privy

-- Políticas para user_profiles
CREATE POLICY "Acceso público a perfiles"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Actualización de perfiles autenticados con Privy"
  ON user_profiles FOR UPDATE
  USING (true);

CREATE POLICY "Inserción de perfiles para cualquier usuario"
  ON user_profiles FOR INSERT
  WITH CHECK (true);

-- Políticas para game_scores
CREATE POLICY "Acceso público a puntuaciones"
  ON game_scores FOR SELECT
  USING (true);

CREATE POLICY "Inserción de puntuaciones para cualquier usuario"
  ON game_scores FOR INSERT
  WITH CHECK (true);

-- Políticas para user_tokens
CREATE POLICY "Acceso público a tokens"
  ON user_tokens FOR SELECT
  USING (true);

CREATE POLICY "Inserción de tokens para cualquier usuario"
  ON user_tokens FOR INSERT
  WITH CHECK (true);

-- Función para calcular el saldo total de tokens de un usuario
CREATE OR REPLACE FUNCTION get_user_token_balance(user_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM user_tokens
  WHERE user_tokens.user_id = $1;
$$ LANGUAGE SQL; 