-- Copy and paste this into Supabase SQL Editor

-- 1. Enable RLS on all sensitive tables
ALTER TABLE "base_datos_sgi" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lineas_analisis" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lineas_contrato" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lineas_coste" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lineas_planin" ENABLE ROW LEVEL SECURITY;
-- Note: 'Users' table might already have RLS, but ensuring it is enabled.
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;

-- 2. Create Helper Function to check access
-- This function checks if the current user has the requested obra in their allowed list
CREATE OR REPLACE FUNCTION public.check_user_access(requested_obra text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public."Users"
    WHERE auth_user_id = auth.uid()
    AND "Aceptado" = true
    AND (
      -- Admin access: 'todas' is in the array
      'todas' = ANY(obras)
      OR
      -- Specific access: requested_obra is in the array
      requested_obra = ANY(obras)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Policies for Data Tables

-- Policy for base_datos_sgi
DROP POLICY IF EXISTS "Users can view assigned obras" ON "base_datos_sgi";
CREATE POLICY "Users can view assigned obras" ON "base_datos_sgi"
FOR SELECT USING (
  check_user_access(cod_obra)
);

-- Policy for lineas_analisis
DROP POLICY IF EXISTS "Users can view analysis of assigned obras" ON "lineas_analisis";
CREATE POLICY "Users can view analysis of assigned obras" ON "lineas_analisis"
FOR SELECT USING (
  check_user_access(cod_obra)
);

-- Policy for lineas_contrato
DROP POLICY IF EXISTS "Users can view contract of assigned obras" ON "lineas_contrato";
CREATE POLICY "Users can view contract of assigned obras" ON "lineas_contrato"
FOR SELECT USING (
  check_user_access(cod_obra)
);

-- Policy for lineas_coste
DROP POLICY IF EXISTS "Users can view cost of assigned obras" ON "lineas_coste";
CREATE POLICY "Users can view cost of assigned obras" ON "lineas_coste"
FOR SELECT USING (
  check_user_access(cod_obra)
);

-- Policy for lineas_planin
DROP POLICY IF EXISTS "Users can view planning of assigned obras" ON "lineas_planin";
CREATE POLICY "Users can view planning of assigned obras" ON "lineas_planin"
FOR SELECT USING (
  check_user_access(cod_obra)
);

-- 4. Policy for Users table (Self-service check)
-- Users should be able to read their own record to know which `obras` they have access to.
DROP POLICY IF EXISTS "Users can view their own record" ON "Users";
CREATE POLICY "Users can view their own record" ON "Users"
FOR SELECT USING (
  auth_user_id = auth.uid()
);

-- 5. Policy for updating coef_k in base_datos_sgi
-- Only allow update if the user has access to that obra
DROP POLICY IF EXISTS "Users can update coef_k of assigned obras" ON "base_datos_sgi";
CREATE POLICY "Users can update coef_k of assigned obras" ON "base_datos_sgi"
FOR UPDATE USING (
  check_user_access(cod_obra)
) WITH CHECK (
  check_user_access(cod_obra)
);
