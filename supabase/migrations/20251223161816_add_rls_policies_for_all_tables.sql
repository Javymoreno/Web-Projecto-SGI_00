/*
  # Agregar políticas RLS para todas las tablas

  1. Cambios
    - Agregar políticas SELECT para usuarios authenticated en todas las tablas
    - Permite que usuarios autenticados y aceptados puedan leer datos
    - Aplica a: lineas_analisis, lineas_contrato, lineas_coste, lineas_planin, obra_coef_k
  
  2. Seguridad
    - Solo usuarios autenticados con Aceptado=TRUE pueden leer
    - Solo usuarios específicos pueden escribir (se mantienen las políticas existentes)
*/

-- lineas_analisis
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lineas_analisis' 
    AND policyname = 'authenticated_select_lineas_analisis'
  ) THEN
    CREATE POLICY "authenticated_select_lineas_analisis"
      ON lineas_analisis
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM "Users"
          WHERE "Users".auth_user_id = auth.uid()
          AND "Users"."Aceptado" = true
        )
      );
  END IF;
END $$;

-- lineas_contrato
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lineas_contrato' 
    AND policyname = 'authenticated_select_lineas_contrato'
  ) THEN
    CREATE POLICY "authenticated_select_lineas_contrato"
      ON lineas_contrato
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM "Users"
          WHERE "Users".auth_user_id = auth.uid()
          AND "Users"."Aceptado" = true
        )
      );
  END IF;
END $$;

-- lineas_coste
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lineas_coste' 
    AND policyname = 'authenticated_select_lineas_coste'
  ) THEN
    CREATE POLICY "authenticated_select_lineas_coste"
      ON lineas_coste
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM "Users"
          WHERE "Users".auth_user_id = auth.uid()
          AND "Users"."Aceptado" = true
        )
      );
  END IF;
END $$;

-- lineas_planin
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'lineas_planin' 
    AND policyname = 'authenticated_select_lineas_planin'
  ) THEN
    CREATE POLICY "authenticated_select_lineas_planin"
      ON lineas_planin
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM "Users"
          WHERE "Users".auth_user_id = auth.uid()
          AND "Users"."Aceptado" = true
        )
      );
  END IF;
END $$;

-- obra_coef_k
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'obra_coef_k' 
    AND policyname = 'authenticated_select_obra_coef_k'
  ) THEN
    CREATE POLICY "authenticated_select_obra_coef_k"
      ON obra_coef_k
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM "Users"
          WHERE "Users".auth_user_id = auth.uid()
          AND "Users"."Aceptado" = true
        )
      );
  END IF;
END $$;
