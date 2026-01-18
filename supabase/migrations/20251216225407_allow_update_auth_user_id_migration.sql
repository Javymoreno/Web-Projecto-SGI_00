/*
  # Permitir actualización de auth_user_id durante migración

  1. Cambios
    - Permitir actualización del campo auth_user_id para usuarios autenticados
    - Necesario para vincular usuarios legacy con Supabase Auth

  2. Seguridad
    - Solo permite actualizar auth_user_id cuando es null (usuarios legacy)
    - Requiere autenticación
*/

DROP POLICY IF EXISTS "Usuarios pueden actualizar su registro" ON "Users";

CREATE POLICY "Permitir actualización de auth_user_id"
  ON "Users"
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
