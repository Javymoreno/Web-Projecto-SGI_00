/*
  # Actualizar políticas RLS de Users para permitir verificación de contraseña

  1. Cambios
    - Permitir lectura de todos los campos (incluyendo Password) para validación durante login
    - Esto es necesario para migrar usuarios existentes a Supabase Auth

  2. Seguridad
    - Solo lectura, no escritura
    - Necesario temporalmente para migración de usuarios legacy
*/

DROP POLICY IF EXISTS "Permitir lectura pública para validación" ON "Users";

CREATE POLICY "Permitir lectura completa para validación"
  ON "Users"
  FOR SELECT
  TO anon, authenticated
  USING (true);
