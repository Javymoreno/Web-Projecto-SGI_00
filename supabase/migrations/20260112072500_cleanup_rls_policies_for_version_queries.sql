/*
  # Limpiar políticas RLS conflictivas

  1. Cambios
    - Eliminar políticas RLS de anon que filtran por origen (causan conflictos)
    - Mantener políticas simples para authenticated
    - Permite que las consultas SELECT DISTINCT version funcionen correctamente
  
  2. Seguridad
    - Se mantienen las políticas para usuarios autenticados
    - Se mantienen las políticas de escritura restrictivas
*/

-- Eliminar políticas anon que filtran por origen en lineas_contrato
DROP POLICY IF EXISTS "anon_select_origen_lineas_contrato" ON lineas_contrato;
DROP POLICY IF EXISTS "anon_select_on_lineas_contrato" ON lineas_contrato;

-- Eliminar políticas anon que filtran por origen en lineas_coste
DROP POLICY IF EXISTS "anon_select_origen_lineas_coste" ON lineas_coste;
DROP POLICY IF EXISTS "anon_select_on_lineas_coste" ON lineas_coste;

-- Eliminar políticas anon que filtran por origen en lineas_analisis
DROP POLICY IF EXISTS "anon_select_origen_lineas_analisis" ON lineas_analisis;
DROP POLICY IF EXISTS "anon_select_on_lineas_analisis" ON lineas_analisis;

-- Eliminar políticas anon que filtran por origen en lineas_planin
DROP POLICY IF EXISTS "anon_select_origen_lineas_planin" ON lineas_planin;
DROP POLICY IF EXISTS "anon_select_on_lineas_planin" ON lineas_planin;
