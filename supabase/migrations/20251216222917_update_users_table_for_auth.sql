/*
  # Actualizar tabla Users para sistema de autenticación

  1. Cambios en Tabla Users
    - Añadir campo `auth_user_id` para vincular con Supabase Auth
    - Añadir campo `approved_at` para fecha de aprobación
    - Añadir índices para mejorar rendimiento
    - Actualizar constraints

  2. Seguridad
    - Actualizar políticas RLS existentes
    - Permitir a usuarios ver su propio registro
    - Permitir inserción para registro de nuevos usuarios

  3. Notas importantes
    - La autenticación real se hace con Supabase Auth
    - Esta tabla mantiene el registro de usuarios y su estado de aprobación
    - El campo Password se mantendrá por compatibilidad pero no se usará
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Users' AND column_name = 'auth_user_id'
  ) THEN
    ALTER TABLE "Users" ADD COLUMN auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Users' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE "Users" ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE "Users" ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_mail ON "Users"("Mail");
CREATE INDEX IF NOT EXISTS idx_users_aceptado ON "Users"("Aceptado");
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON "Users"(auth_user_id);

DROP POLICY IF EXISTS "Permitir lectura pública" ON "Users";
DROP POLICY IF EXISTS "Usuarios pueden ver su propio registro" ON "Users";
DROP POLICY IF EXISTS "Permitir inserción de nuevos usuarios" ON "Users";
DROP POLICY IF EXISTS "Usuarios pueden actualizar su registro" ON "Users";

CREATE POLICY "Usuarios pueden ver su propio registro"
  ON "Users"
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id OR "Aceptado" = true);

CREATE POLICY "Permitir lectura pública para validación"
  ON "Users"
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Permitir inserción para registro"
  ON "Users"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION check_user_approved_by_email(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM "Users"
    WHERE "Mail" = user_email
    AND "Aceptado" = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION get_user_by_auth_id(user_id uuid)
RETURNS TABLE (
  id bigint,
  nombre text,
  mail text,
  aceptado boolean,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u."Nombre" as nombre,
    u."Mail" as mail,
    u."Aceptado" as aceptado,
    u.created_at
  FROM "Users" u
  WHERE u.auth_user_id = user_id;
END;
$$;
