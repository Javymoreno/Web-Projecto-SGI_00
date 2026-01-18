/*
  # Simplificar políticas RLS

  1. Cambios
    - Eliminar políticas duplicadas
    - Dejar solo una política SELECT simple para authenticated
  
  2. Seguridad
    - Mantener políticas de escritura restrictivas
    - Permitir lectura a usuarios autenticados
*/

-- Limpiar políticas en lineas_contrato
DROP POLICY IF EXISTS "authenticated_select_lineas_contrato" ON lineas_contrato;
DROP POLICY IF EXISTS "lineas_contrato_select_authenticated" ON lineas_contrato;

CREATE POLICY "lineas_contrato_select_all"
  ON lineas_contrato
  FOR SELECT
  TO authenticated
  USING (true);

-- Limpiar políticas en lineas_coste
DROP POLICY IF EXISTS "authenticated_select_lineas_coste" ON lineas_coste;
DROP POLICY IF EXISTS "lineas_coste_select_authenticated" ON lineas_coste;

CREATE POLICY "lineas_coste_select_all"
  ON lineas_coste
  FOR SELECT
  TO authenticated
  USING (true);

-- Limpiar políticas en lineas_analisis
DROP POLICY IF EXISTS "authenticated_select_lineas_analisis" ON lineas_analisis;
DROP POLICY IF EXISTS "lineas_analisis_select_authenticated" ON lineas_analisis;

CREATE POLICY "lineas_analisis_select_all"
  ON lineas_analisis
  FOR SELECT
  TO authenticated
  USING (true);

-- Limpiar políticas en lineas_planin
DROP POLICY IF EXISTS "authenticated_select_lineas_planin" ON lineas_planin;
DROP POLICY IF EXISTS "lineas_planin_select_authenticated" ON lineas_planin;

CREATE POLICY "lineas_planin_select_all"
  ON lineas_planin
  FOR SELECT
  TO authenticated
  USING (true);
