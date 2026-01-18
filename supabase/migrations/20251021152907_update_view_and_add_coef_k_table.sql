/*
  # Update vw_analisisdetallado and add coef_k table

  1. Changes to vw_analisisdetallado
    - Add tipo_informacion column from lineas table (for Contrato and Coste)
    - Add cant_descomp columns for Contrato and Coste versions
    - This allows showing cantdescomp values for Descompuesto type rows

  2. New Table: obra_coef_k
    - Stores Coef. de paso K per cod_obra
    - `cod_obra` (text, primary key) - Work code identifier
    - `coef_k` (numeric) - K coefficient value
    - `updated_at` (timestamp) - Last update timestamp
    
  3. Security
    - Enable RLS on obra_coef_k table
    - Add policy for authenticated users to read all coefficients
    - Add policy for authenticated users to insert/update coefficients
*/

-- Drop existing view
DROP VIEW IF EXISTS public.vw_analisisdetallado;

-- Create updated view with tipo_informacion and cant_descomp
CREATE OR REPLACE VIEW public.vw_analisisdetallado AS
SELECT
  la.id,
  la.indice,
  la.file_name,
  la.cod_obra,
  la.origen,
  la.version AS versionada,
  la."Nivel",
  la."EDT",
  la.codigo,
  la.codigo2,
  la.ud,
  la.resumen,
  la."Resumen2",
  la."UserText",
  la."UserText1",
  la."UserNumber",
  la."Nota",
  la.nat,
  la."CodSup",
  la."CodInf",
  la."Guid_SGI",
  la."Cap_SIS",
  la.clave_compuesta,
  la.clave_compuesta_cto,
  la.inserted_at,
  
  -- Contrato versions (join using clave_compuesta_cto)
  c0.canpres         AS Contrato_v0_cant,
  c0.cant_descomp    AS Contrato_v0_cantdescomp,
  c0.pres            AS Contrato_v0_precio,
  c0.imppres         AS Contrato_v0_importe,
  c0.tipo_informacion AS Contrato_v0_tipo,

  c1.canpres         AS Contrato_v1_cant,
  c1.cant_descomp    AS Contrato_v1_cantdescomp,
  c1.pres            AS Contrato_v1_precio,
  c1.imppres         AS Contrato_v1_importe,
  c1.tipo_informacion AS Contrato_v1_tipo,

  c2.canpres         AS Contrato_v2_cant,
  c2.cant_descomp    AS Contrato_v2_cantdescomp,
  c2.pres            AS Contrato_v2_precio,
  c2.imppres         AS Contrato_v2_importe,
  c2.tipo_informacion AS Contrato_v2_tipo,

  -- Coste versions (join using la.clave_compuesta)
  t0.canpres         AS Coste_v0_cant,
  t0.cant_descomp    AS Coste_v0_cantdescomp,
  t0.pres            AS Coste_v0_precio,
  t0.imppres         AS Coste_v0_importe,
  t0.tipo_informacion AS Coste_v0_tipo,

  t1.canpres         AS Coste_v1_cant,
  t1.cant_descomp    AS Coste_v1_cantdescomp,
  t1.pres            AS Coste_v1_precio,
  t1.imppres         AS Coste_v1_importe,
  t1.tipo_informacion AS Coste_v1_tipo,

  t2.canpres         AS Coste_v2_cant,
  t2.cant_descomp    AS Coste_v2_cantdescomp,
  t2.pres            AS Coste_v2_precio,
  t2.imppres         AS Coste_v2_importe,
  t2.tipo_informacion AS Coste_v2_tipo

FROM public.lineas_analisis la

-- Contrato joins (use clave_compuesta_cto)
LEFT JOIN LATERAL (
  SELECT l.canpres, l.cant_descomp, l.pres, l.imppres, l.tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 0
  LIMIT 1
) c0 ON TRUE

LEFT JOIN LATERAL (
  SELECT l.canpres, l.cant_descomp, l.pres, l.imppres, l.tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 1
  LIMIT 1
) c1 ON TRUE

LEFT JOIN LATERAL (
  SELECT l.canpres, l.cant_descomp, l.pres, l.imppres, l.tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta_cto
    AND l.origen = 'Contrato'
    AND COALESCE(l.version, 0) = 2
  LIMIT 1
) c2 ON TRUE

-- Coste joins (use clave_compuesta)
LEFT JOIN LATERAL (
  SELECT l.canpres, l.cant_descomp, l.pres, l.imppres, l.tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 0
  LIMIT 1
) t0 ON TRUE

LEFT JOIN LATERAL (
  SELECT l.canpres, l.cant_descomp, l.pres, l.imppres, l.tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 1
  LIMIT 1
) t1 ON TRUE

LEFT JOIN LATERAL (
  SELECT l.canpres, l.cant_descomp, l.pres, l.imppres, l.tipo_informacion
  FROM public.lineas l
  WHERE l.clave_compuesta = la.clave_compuesta
    AND l.origen = 'Coste'
    AND COALESCE(l.version, 0) = 2
  LIMIT 1
) t2 ON TRUE

ORDER BY la.indice;

-- Create obra_coef_k table
CREATE TABLE IF NOT EXISTS public.obra_coef_k (
  cod_obra text PRIMARY KEY,
  coef_k numeric NOT NULL DEFAULT 1.0,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.obra_coef_k ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all coefficients"
  ON public.obra_coef_k
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert coefficients"
  ON public.obra_coef_k
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update coefficients"
  ON public.obra_coef_k
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
