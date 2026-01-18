/*
  # Corregir RLS para permitir lectura a usuarios autenticados

  1. Cambios
    - Agregar política SELECT para usuarios authenticated en base_datos_sgi
    - Permite que usuarios autenticados y aceptados puedan leer las obras
    - Soluciona el error "No se encontraron obras en la base de datos"
  
  2. Seguridad
    - Solo usuarios autenticados con Aceptado=TRUE pueden leer
    - No afecta las políticas de escritura existentes
*/

-- Crear política SELECT para usuarios autenticados en base_datos_sgi
CREATE POLICY "authenticated_select_base_datos_sgi"
  ON base_datos_sgi
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "Users"
      WHERE "Users".auth_user_id = auth.uid()
      AND "Users"."Aceptado" = true
    )
  );
